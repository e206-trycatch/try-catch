package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFilesRespDto;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
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
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static io.ssafy.trycatch.global.exception.ErrorCode.ROOM_NOT_FOUND;
import static io.ssafy.trycatch.global.exception.ErrorCode.SUBMISSION_NOT_FOUND;

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
    private final ProblemFileRepository problemFileRepository;

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

        if (room.getLife() <= 0) {
            throw new CustomException(ErrorCode.GAMEOVER);
        }

        // 2단계: GPT 채점 (트랜잭션 밖 - 외부 API 호출)
        List<ScoreResult> scoreResults = scoreSubmissions(context, room);

        // 3단계: 결과 업데이트 및 응답 생성 (트랜잭션 내)
        return updateAndBuildResponse(context, scoreResults);
    }

    @Transactional(readOnly = true)
    public SubmissionRespDto getSubmission(Long roomId, Long userId) {
        // 1. Room 조회
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 2. 해당 방의 가장 최근 제출 조회
        Submission latestSubmission = submissionRepository
                .findTopByRoomIdAndUserIdOrderBySubmittedAtDesc(roomId, userId)
                .orElseThrow(() -> new CustomException(SUBMISSION_NOT_FOUND));

        // 3. 해당 제출의 모든 파일 조회 (Frontend + Backend)
        List<Submission> allSubmissions = submissionRepository
                .findByRoomIdAndUserIdAndSubmittedAtOrderByIdAsc(
                        roomId, userId, latestSubmission.getSubmittedAt()
                );

        // 4. Role 정보 구성
        List<SubmissionRespDto.RoleInfo> roles = allSubmissions.stream()
                .map(submission -> {
                    Long problemFrameworkId = submission.getProblemFrameworkId();

                    // Frontend/Backend 판단 (간단하게 처리)
                    List<SubmissionFile> files = submissionFileRepository
                            .findBySubmissionIdAndIsDeleted(submission.getId(), TrueOrFalse.F);

                    String role = files.stream()
                            .anyMatch(f -> f.getCodeRole() == SubmissionFile.CodeRole.FRONTEND)
                            ? "FRONTEND" : "BACKEND";

                    return SubmissionRespDto.RoleInfo.builder()
                            .role(role)
                            .frameworkId(problemFrameworkId)
                            .build();
                })
                .toList();

        // 5. 평균 점수 계산
        int averageScore = (int) allSubmissions.stream()
                .mapToInt(s -> s.getScore() != null ? s.getScore() : 0)
                .average()
                .orElse(0);

        // 6. 전체 실행 시간 합계
        long totalExecutionTime = allSubmissions.stream()
                .mapToLong(s -> s.getExecutionTime() != null ? s.getExecutionTime() : 0L)
                .sum();

        // 7. 성공 여부 판단
        boolean allSuccess = allSubmissions.stream()
                .allMatch(s -> s.getStatus() == Submission.Status.SUCCESS);

        // 8. 에러 로그 수집
        String errorLog = allSubmissions.stream()
                .map(Submission::getErrorLog)
                .filter(log -> log != null && !log.isEmpty())
                .collect(Collectors.joining("\n"));

        // 9. Quest 정보 조회
        Long problemFrameworkId = latestSubmission.getProblemFrameworkId();
        Long questId = getCurrentQuestId(problemFrameworkId);
        Integer questOrder = getCurrentQuestOrder(problemFrameworkId);

        // 10. 응답 생성
        if (allSuccess) {
            return buildSuccessResponse(
                    latestSubmission.getId(),
                    roomId,
                    questId,
                    questOrder,
                    averageScore,
                    totalExecutionTime,
                    room,
                    roles
            );
        } else {
            return buildFailResponse(
                    latestSubmission.getId(),
                    roomId,
                    questId,
                    questOrder,
                    averageScore,
                    totalExecutionTime,
                    room,
                    errorLog
            );
        }
    }

    @Transactional
    public SubmissionContext createSubmissions(Long roomId, Long userId, SubmissionReqDto request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        SubmissionContext context = new SubmissionContext(room);

        Long problemFrameworkId = request.getProblemFrameworkId();

        // Frontend 제출 처리
        if (request.getFrontend() != null
                && request.getFrontend().getFiles() != null
                && !request.getFrontend().getFiles().isEmpty()) {
            processRoleSubmission(
                    roomId, userId, request.getFrontend(), "FRONTEND", problemFrameworkId, context
            );
        }

        // Backend 제출 처리
        if (request.getBackend() != null
                && request.getBackend().getFiles() != null
                && !request.getBackend().getFiles().isEmpty()) {
            processRoleSubmission(
                    roomId, userId, request.getBackend(), "BACKEND", problemFrameworkId, context
            );
        }

        return context;
    }

    private void processRoleSubmission(
            Long roomId,
            Long userId,
            SubmissionReqDto.SubmissionItem item,
            String roleName,
            Long problemFrameworkId,
            SubmissionContext context
    ) {
        // Submission 생성 및 저장
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(problemFrameworkId)
                .status(Submission.Status.FAIL)
                .build();
        submission = submissionRepository.save(submission);

        // SubmissionFile 저장
        List<SubmissionFile> files = saveSubmissionFiles(submission.getId(), item.getFiles());

        // Context에 정보 저장
        context.addSubmission(submission, files, roleName, problemFrameworkId);
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

        if (filePath.contains("/frontend")
                || filePath.contains("/components/")
                || filePath.endsWith(".jsx") || filePath.endsWith(".vue")) {
            return SubmissionFile.CodeRole.FRONTEND;
        } else if (filePath.contains("/backend")
                || filePath.endsWith(".java") || filePath.endsWith(".py")) {
            return SubmissionFile.CodeRole.BACKEND;
        }
        return SubmissionFile.CodeRole.FRONTEND;
    }

    // GPT 채점 (트랜잭션 밖)
    private List<ScoreResult> scoreSubmissions(SubmissionContext context, Room room) {
        List<ScoreResult> results = new ArrayList<>();

        for (SubmissionContext.SubmissionData data : context.getSubmissionDataList()) {
            Long problemFrameworkId = data.getFrameworkId();
            String problemDoc = getProblemDoc(problemFrameworkId);
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
        Long problemFrameworkId = submissions.get(0).getProblemFrameworkId();
        Long currentQuestId = getCurrentQuestId(submissions.get(0).getProblemFrameworkId());
        Integer currentQuestOrder = getCurrentQuestOrder(problemFrameworkId);

        if (allSuccess) {
            return buildSuccessResponse(
                    submissions.get(0).getId(),
                    room.getId(),
                    currentQuestId,
                    currentQuestOrder,
                    averageScore,
                    totalExecutionTime,
                    room,
                    roles
            );
        } else {
            // 실패 시 life 감소
            room.decreaseLife();
            return buildFailResponse(
                    submissions.get(0).getId(),
                    room.getId(),
                    currentQuestId,
                    currentQuestOrder,
                    averageScore,
                    totalExecutionTime,
                    room,
                    errorLog
            );
        }
    }

    private Integer getCurrentQuestOrder(Long problemFrameworkId) {
        ProblemFramework pf = problemFrameworkRepository
                .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .orElse(null);

        if (pf == null) return null;

        return questRepository.findById(pf.getQuestId())
                .map(Quest::getQuestOrder)
                .orElse(null);
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

    /**
     * ProblemFile에서 DOC 파일 가져오기
     */
    private String getProblemDoc(Long problemFrameworkId) {
        List<ProblemFile> docFiles = problemFileRepository
                .findByProblemFrameworkIdAndFileTypeAndIsDeleted(
                        problemFrameworkId, FileType.DOC, TrueOrFalse.F
                );

        return docFiles.stream()
                .map(file -> String.format("## DOC: %s\n%s\n\n", safe(file.getFilePath()), safe(file.getCode())))
                .collect(Collectors.joining());
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
            Long questId,
            Integer currentQuestOrder,
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
                .questId(questId)
                .questOrder(currentQuestOrder)
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
            Integer currentQuestOrder,
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
                .questOrder(currentQuestOrder)
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

    /**
     * 재도전을 위한 문제 파일 목록 조회
     * - 해당 submission의 제출 코드 (SubmissionFile)
     * - 해당 problemFramework의 DOC 파일 (ProblemFile)
     */
    @Transactional(readOnly = true)
    public ProblemFilesRespDto getProblemFilesForRetry(Long roomId, Long submissionId, Long userId) {
        // 1. Room 존재 확인
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

        // 2. Submission 조회 및 권한 확인
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SUBMISSION_NOT_FOUND));

        // 권한 체크: 본인의 제출인지, 같은 방인지 확인
        validateSubmissionAccess(submission, userId, roomId);
        
        // 3. ProblemFramework 조회
        Long problemFrameworkId = submission.getProblemFrameworkId();
        ProblemFramework problemFramework = problemFrameworkRepository
                .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException("문제 프레임워크를 찾을 수 없습니다."));

        // 4. 같은 시간에 제출된 모든 submission 조회 (Frontend + Backend)
        List<Submission> allSubmissions = submissionRepository
                .findByRoomIdAndUserIdAndSubmittedAtOrderByIdAsc(
                        roomId, userId, submission.getSubmittedAt()
                );

        // 5. 제출 파일들 조회 (SOURCE, CONFIG 등)
        List<ProblemFileRespDto> submittedFiles = new ArrayList<>();
        for (Submission sub : allSubmissions) {
            List<SubmissionFile> files = submissionFileRepository
                    .findBySubmissionIdAndIsDeleted(sub.getId(), TrueOrFalse.F);

            // SubmissionFile -> ProblemFileRespDto 변환
            files.stream()
                    .filter(f -> f.getFileType() != SubmissionFile.FileType.DOC) // DOC 제외
                    .forEach(file -> submittedFiles.add(
                            ProblemFileRespDto.builder()
                                    .fileId(file.getId())
                                    .filePath(file.getFilePath())
                                    .codeRole(convertCodeRole(file.getCodeRole()))
                                    .code(file.getCode())
                                    .fileType(convertFileType(file.getFileType()))
                                    .build()
                    ));
        }

        // 6. DOC 파일 조회 (ProblemFile에서)
        List<ProblemFile> docFiles = problemFileRepository
                .findByProblemFrameworkIdAndFileTypeAndIsDeleted(
                        problemFrameworkId, FileType.DOC, TrueOrFalse.F
                );

        // ProblemFile -> ProblemFileRespDto 변환
        List<ProblemFileRespDto> docFileDtos = docFiles.stream()
                .map(file -> ProblemFileRespDto.builder()
                        .fileId(file.getId())
                        .filePath(file.getFilePath())
                        .codeRole(file.getCodeRole())
                        .code(file.getCode())
                        .fileType(file.getFileType())
                        .build())
                .toList();

        // 7. 모든 파일 합치기 (제출 파일 + DOC 파일)
        List<ProblemFileRespDto> allFiles = new ArrayList<>();
        allFiles.addAll(submittedFiles);
        allFiles.addAll(docFileDtos);

        // 8. 응답 생성
        return ProblemFilesRespDto.builder()
                .problemFrameworkId(problemFrameworkId)
                .frontendErrorLog(problemFramework.getFrontendErrorLog())
                .backendErrorLog(problemFramework.getBackendErrorLog())
                .files(allFiles)
                .build();
    }

    private void validateSubmissionAccess(Submission submission, Long userId, Long roomId) {
        if (!submission.getUserId().equals(userId)) { // 본인의 제출이 아닌 경우
            throw new CustomException(ErrorCode.UNAUTHORIZED_SUBMISSION_ACCESS);
        }

        if (!submission.getRoomId().equals(roomId)) { // 같은 방의 제출이 아닌 경우
            throw new CustomException(ErrorCode.UNAUTHORIZED_SUBMISSION_ACCESS);
        }
    }

    // SubmissionFile.CodeRole -> FrameworkCategory 변환
    private FrameworkCategory convertCodeRole(SubmissionFile.CodeRole codeRole) {
        return codeRole == SubmissionFile.CodeRole.FRONTEND
                ? FrameworkCategory.FRONTEND
                : FrameworkCategory.BACKEND;
    }

    // SubmissionFile.FileType -> FileType 변환
    private FileType convertFileType(SubmissionFile.FileType fileType) {
        return FileType.valueOf(fileType.name());
    }
}