package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.repository.ProblemFrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.QuestRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.ScoreResult;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.entity.Submission;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.domain.submission.repository.SubmissionFileRepository;
import io.ssafy.trycatch.domain.submission.repository.SubmissionRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final RoomRepository roomRepository;
    private final GptScoringService gptScoringService;
    private final ProblemFrameworkRepository problemFrameworkRepository;
    private final QuestRepository questRepository;

    private static final String FRONTEND_RUBRIC = """
            - 요구사항(문제 설명) 충족 여부
            - 컴포넌트 구조/가독성
            - 명백한 런타임 오류 가능성 여부
            - 이벤트/상태 처리의 적절성
            """;

    private static final String BACKEND_RUBRIC = """
            - 요구사항(문제 설명) 충족 여부
            - REST API 설계/입출력/상태코드의 타당성
            - 예외 처리/검증 로직의 적절성
            - 명백한 컴파일/런타임 오류 가능성 여부
            """;

    @Transactional
    public SubmissionRespDto submit(Long roomId, Long userId, SubmissionReqDto request) {
        // 1단계: DB 작업 (트랜잭션 내)
        SubmissionContext context = createSubmissions(roomId, userId, request);
        Room room = context.getRoom();
        // 2단계: GPT 채점 (트랜잭션 밖 - 외부 API 호출)
        List<ScoreResult> scoreResults = scoreSubmissions(context, room);

        // 3단계: 결과 업데이트 및 응답 생성 (트랜잭션 내)
        return updateAndBuildResponse(context, scoreResults);
    }

    @Transactional
    public SubmissionContext createSubmissions(Long roomId, Long userId, SubmissionReqDto request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        SubmissionContext context = new SubmissionContext(room);

        // Frontend 제출 처리
        if (request.getFrontend() != null) {
            processRoleSubmission(
                    roomId, userId, request.getFrontend(), "FRONTEND", context
            );
        }

        // Backend 제출 처리
        if (request.getBackend() != null) {
            processRoleSubmission(
                    roomId, userId, request.getBackend(), "BACKEND", context
            );
        }

        return context;
    }

    private void processRoleSubmission(
            Long roomId,
            Long userId,
            SubmissionReqDto.SubmissionItem item,
            String roleName,
            SubmissionContext context
    ) {
        // Submission 생성 및 저장
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(item.getProblemFrameworkId())
                .status(Submission.Status.FAIL)
                .build();
        submission = submissionRepository.save(submission);

        // SubmissionFile 저장
        List<SubmissionFile> files = saveSubmissionFiles(submission.getId(), item.getFiles());

        // Context에 정보 저장
        context.addSubmission(submission, files, roleName, item.getProblemFrameworkId());
    }

    private List<SubmissionFile> saveSubmissionFiles(Long submissionId, List<SubmissionReqDto.FileItem> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<SubmissionFile> submissionFiles = files.stream()
                .map(file -> SubmissionFile.builder()
                        .submissionId(submissionId)
                        .filePath(file.getFilePath())
                        .codeRole(determineCodeRole(file.getFilePath()))
                        .fileType(SubmissionFile.FileType.valueOf(file.getFileType()))
                        .code(file.getCode())
                        .build())
                .toList();

        return submissionFileRepository.saveAll(submissionFiles);
    }

    private SubmissionFile.CodeRole determineCodeRole(String filePath) {
        if (filePath == null) {
            return SubmissionFile.CodeRole.FRONTEND;
        }

        if (filePath.contains("/frontend/")
                || filePath.contains("/components/")
                || (filePath.contains("/src/") && filePath.endsWith(".jsx"))) {
            return SubmissionFile.CodeRole.FRONTEND;
        } else if (filePath.contains("/backend/") || filePath.contains("/java/")) {
            return SubmissionFile.CodeRole.BACKEND;
        }
        return SubmissionFile.CodeRole.FRONTEND;
    }

    // GPT 채점 (트랜잭션 밖)
    private List<ScoreResult> scoreSubmissions(SubmissionContext context, Room room) {
        List<ScoreResult> results = new ArrayList<>();

        for (SubmissionContext.SubmissionData data : context.getSubmissionDataList()) {
            String problemDoc = combineDoc(data.getFiles());
            String submittedSource = combineSource(data.getFiles());
            String rubric = data.getRoleName().equals("FRONTEND") ? FRONTEND_RUBRIC : BACKEND_RUBRIC;

            ScoreResult score = gptScoringService.scoreSubmission(problemDoc, submittedSource, rubric, room);
            results.add(score);
        }

        return results;
    }

    @Transactional
    public SubmissionRespDto updateAndBuildResponse(
            SubmissionContext context,
            List<ScoreResult> scoreResults
    ) {
        List<Submission> submissions = context.getSubmissions();
        List<SubmissionRespDto.RoleInfo> roles = new ArrayList<>();

        // 각 Submission 결과 업데이트
        for (int i = 0; i < submissions.size(); i++) {
            Submission submission = submissions.get(i);
            ScoreResult score = scoreResults.get(i);
            SubmissionContext.SubmissionData data = context.getSubmissionDataList().get(i);

            submission.updateResult(
                    score.getSuccess() ? Submission.Status.SUCCESS : Submission.Status.FAIL,
                    score.getExecutionTime(),
                    score.getErrorLog(),
                    score.getScore()
            );

            roles.add(SubmissionRespDto.RoleInfo.builder()
                    .role(data.getRoleName())
                    .frameworkId(data.getFrameworkId())
                    .build());
        }

        // 전체 평균 점수 계산
        int averageScore = (int) scoreResults.stream()
                .mapToInt(ScoreResult::getScore)
                .average()
                .orElse(0);

        // 성공 여부 판단
        boolean allSuccess = scoreResults.stream()
                .allMatch(ScoreResult::getSuccess);

        // 실행 시간 합계
        long totalExecutionTime = scoreResults.stream()
                .mapToLong(result -> result.getExecutionTime() != null ? result.getExecutionTime() : 0L)
                .sum();

        // 에러 로그 수집
        String errorLog = scoreResults.stream()
                .map(ScoreResult::getErrorLog)
                .filter(log -> log != null && !log.isEmpty())
                .collect(Collectors.joining("\n"));

        Room room = context.getRoom();

        if (allSuccess) {
            return buildSuccessResponse(
                    submissions.get(0).getId(),
                    room.getId(),
                    averageScore,
                    totalExecutionTime,
                    room,
                    roles
            );
        } else {
            // 실패 시 life 감소
            room.decreaseLife();
            Long currentQuestId = getCurrentQuestId(submissions.get(0).getProblemFrameworkId());
            return buildFailResponse(
                    submissions.get(0).getId(),
                    room.getId(),
                    currentQuestId,
                    averageScore,
                    totalExecutionTime,
                    room,
                    errorLog
            );
        }
    }

    // problemFrameworkId로 questId 조회
    private Long getCurrentQuestId(Long problemFrameworkId) {
        return problemFrameworkRepository.findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .map(ProblemFramework::getQuestId)
                .orElse(null);
    }

    // 다음 퀘스트 정보 조회
    private SubmissionRespDto.NextQuest getNextQuestInfo(Long problemFrameworkId) {
        // 1. 현재 ProblemFramework에서 questId 조회
        ProblemFramework currentProblemFramework = problemFrameworkRepository
                .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .orElse(null);

        if (currentProblemFramework == null) {
            return SubmissionRespDto.NextQuest.builder()
                    .hasNextQuest(false)
                    .nextQuestId(null)
                    .build();
        }

        // 2. 현재 Quest 조회
        Quest currentQuest = questRepository.findById(currentProblemFramework.getQuestId())
                .orElse(null);

        if (currentQuest == null) {
            return SubmissionRespDto.NextQuest.builder()
                    .hasNextQuest(false)
                    .nextQuestId(null)
                    .build();
        }

        // 3. 다음 Quest 조회
        Quest nextQuest = questRepository.findNextQuest(
                currentQuest.getThemeId(),
                currentQuest.getQuestOrder(),
                TrueOrFalse.F
        ).orElse(null);

        if (nextQuest == null) {
            return SubmissionRespDto.NextQuest.builder()
                    .hasNextQuest(false)
                    .nextQuestId(null)
                    .build();
        }

        return SubmissionRespDto.NextQuest.builder()
                .hasNextQuest(true)
                .nextQuestId(nextQuest.getId())
                .build();
    }

    // DOC만 합치기 (문제 설명)
    private String combineDoc(List<SubmissionFile> files) {
        return files.stream()
                .filter(f -> f.getFileType() == SubmissionFile.FileType.DOC)
                .map(f -> String.format("## DOC: %s\n%s\n\n", safe(f.getFilePath()), safe(f.getCode())))
                .collect(Collectors.joining());
    }

    // SOURCE만 합치기 (제출 코드)
    private String combineSource(List<SubmissionFile> files) {
        return files.stream()
                .filter(f -> f.getFileType() == SubmissionFile.FileType.SOURCE)
                .map(f -> String.format("// File: %s\n%s\n\n", safe(f.getFilePath()), safe(f.getCode())))
                .collect(Collectors.joining());
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private SubmissionRespDto buildSuccessResponse(
            Long submissionId,
            Long roomId,
            int score,
            long executionTime,
            Room room,
            List<SubmissionRespDto.RoleInfo> roles
    ) {
        Long problemFrameworkId = roles.isEmpty() ? null : roles.get(0).getFrameworkId();
        SubmissionRespDto.NextQuest nextQuest = getNextQuestInfo(problemFrameworkId);
        return SubmissionRespDto.builder()
                .submissionId(submissionId)
                .roomId(roomId)
                .status("SUCCESS")
                .score(score)
                .executionTimeMs(executionTime)
                .roomState(SubmissionRespDto.RoomState.builder()
                        .remainingLife(room.getLife())
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .roles(roles)
                .next(nextQuest)
                .build();
    }

    private SubmissionRespDto buildFailResponse(
            Long submissionId,
            Long roomId,
            Long questId,
            int score,
            long executionTime,
            Room room,
            String errorLog
    ) {
        int lifeAfter = room.getLife();

        return SubmissionRespDto.builder()
                .submissionId(submissionId)
                .roomId(roomId)
                .questId(questId)
                .status("FAIL")
                .score(score)
                .executionTimeMs(executionTime)
                .roomState(SubmissionRespDto.RoomState.builder()
                        .remainingLife(lifeAfter)
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .errorLog((errorLog == null || errorLog.isEmpty()) ? "채점에 실패했습니다." : errorLog)
                .build();
    }

    // 내부 Context 클래스
    @lombok.Getter
    private static class SubmissionContext {
        private final Room room;
        private final List<Submission> submissions = new ArrayList<>();
        private final List<SubmissionData> submissionDataList = new ArrayList<>();

        public SubmissionContext(Room room) {
            this.room = room;
        }

        public void addSubmission(Submission submission, List<SubmissionFile> files,
                                  String roleName, Long frameworkId) {
            submissions.add(submission);
            submissionDataList.add(new SubmissionData(submission, files, roleName, frameworkId));
        }

        @lombok.Getter
        @lombok.AllArgsConstructor
        private static class SubmissionData {
            private Submission submission;
            private List<SubmissionFile> files;
            private String roleName;
            private Long frameworkId;
        }
    }
}