package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.ScoreResult;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.entity.Submission;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.domain.submission.repository.SubmissionFileRepository;
import io.ssafy.trycatch.domain.submission.repository.SubmissionRepository;
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

    @Transactional
    public SubmissionRespDto submit(Long roomId, Long userId, SubmissionReqDto request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        List<Submission> submissions = new ArrayList<>();
        List<ScoreResult> scoreResults = new ArrayList<>();
        List<SubmissionRespDto.RoleInfo> roles = new ArrayList<>();

        // Frontend 제출 처리
        if (request.getFrontend() != null) {
            Submission frontendSubmission = createSubmission(roomId, userId, request.getFrontend());
            submissions.add(frontendSubmission);

            List<SubmissionFile> frontendFiles = saveSubmissionFiles(
                    frontendSubmission.getId(),
                    request.getFrontend().getFiles()
            );

            // DOC / SOURCE 분리
            String problemDoc = combineDoc(frontendFiles);
            String submittedSource = combineSource(frontendFiles);

            String rubric = """
                    - 요구사항(문제 설명) 충족 여부
                    - React 컴포넌트 구조/가독성
                    - 명백한 런타임 오류 가능성 여부
                    - 이벤트/상태 처리의 적절성
                    """;

            // 변경된 시그니처로 호출
            ScoreResult frontendScore = gptScoringService.scoreSubmission(problemDoc, submittedSource, rubric);
            scoreResults.add(frontendScore);

            frontendSubmission.updateResult(
                    frontendScore.getSuccess() ? Submission.Status.SUCCESS : Submission.Status.FAIL,
                    frontendScore.getExecutionTime(),
                    frontendScore.getErrorLog(),
                    frontendScore.getScore()
            );

            roles.add(SubmissionRespDto.RoleInfo.builder()
                    .role("FRONTEND")
                    .frameworkId(request.getFrontend().getProblemFrameworkId())
                    .build());
        }

        // Backend 제출 처리
        if (request.getBackend() != null) {
            Submission backendSubmission = createSubmission(roomId, userId, request.getBackend());
            submissions.add(backendSubmission);

            List<SubmissionFile> backendFiles = saveSubmissionFiles(
                    backendSubmission.getId(),
                    request.getBackend().getFiles()
            );

            // DOC / SOURCE 분리
            String problemDoc = combineDoc(backendFiles);
            String submittedSource = combineSource(backendFiles);

            String rubric = """
                    - 요구사항(문제 설명) 충족 여부
                    - REST API 설계/입출력/상태코드의 타당성
                    - 예외 처리/검증 로직의 적절성
                    - 명백한 컴파일/런타임 오류 가능성 여부
                    """;

            // 변경된 시그니처로 호출
            ScoreResult backendScore = gptScoringService.scoreSubmission(problemDoc, submittedSource, rubric);
            scoreResults.add(backendScore);

            backendSubmission.updateResult(
                    backendScore.getSuccess() ? Submission.Status.SUCCESS : Submission.Status.FAIL,
                    backendScore.getExecutionTime(),
                    backendScore.getErrorLog(),
                    backendScore.getScore()
            );

            roles.add(SubmissionRespDto.RoleInfo.builder()
                    .role("BACKEND")
                    .frameworkId(request.getBackend().getProblemFrameworkId())
                    .build());
        }

        int averageScore = (int) scoreResults.stream()
                .mapToInt(ScoreResult::getScore)
                .average()
                .orElse(0);

        boolean allSuccess = scoreResults.stream()
                .allMatch(ScoreResult::getSuccess);

        long totalExecutionTime = scoreResults.stream()
                .mapToLong(result -> result.getExecutionTime() != null ? result.getExecutionTime() : 0L)
                .sum();

        String errorLog = scoreResults.stream()
                .map(ScoreResult::getErrorLog)
                .filter(log -> log != null && !log.isEmpty())
                .collect(Collectors.joining("\n"));

        if (allSuccess) {
            return buildSuccessResponse(
                    submissions.get(0).getId(),
                    roomId,
                    averageScore,
                    totalExecutionTime,
                    room,
                    roles
            );
        } else {
            return buildFailResponse(
                    submissions.get(0).getId(),
                    roomId,
                    room.getThemeId(), // TODO: questId 로직 추가
                    averageScore,
                    totalExecutionTime,
                    room,
                    errorLog
            );
        }
    }

    private Submission createSubmission(Long roomId, Long userId, SubmissionReqDto.SubmissionItem item) {
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(item.getProblemFrameworkId())
                .status(Submission.Status.FAIL)
                .build();

        return submissionRepository.save(submission);
    }

    private List<SubmissionFile> saveSubmissionFiles(Long submissionId, List<SubmissionReqDto.FileItem> files) {
        if (files == null) return List.of();

        List<SubmissionFile> submissionFiles = files.stream()
                .map(file -> SubmissionFile.builder()
                        .submissionId(submissionId)
                        .filePath(file.getFilePath())
                        .codeRole(determineCodeRole(file.getFilePath()))
                        // 프론트에서 "DOC"/"SOURCE" 대문자로 보내야 valueOf가 안전함
                        .fileType(SubmissionFile.FileType.valueOf(file.getFileType()))
                        .code(file.getCode())
                        .build())
                .toList();

        return submissionFileRepository.saveAll(submissionFiles);
    }

    private SubmissionFile.CodeRole determineCodeRole(String filePath) {
        if (filePath == null) return SubmissionFile.CodeRole.FRONTEND;

        // 괄호로 우선순위 보정
        if (filePath.contains("/frontend/")
                || filePath.contains("/components/")
                || (filePath.contains("/src/") && filePath.endsWith(".jsx"))) {
            return SubmissionFile.CodeRole.FRONTEND;
        } else if (filePath.contains("/backend/") || filePath.contains("/java/")) {
            return SubmissionFile.CodeRole.BACKEND;
        }
        return SubmissionFile.CodeRole.FRONTEND;
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
        return SubmissionRespDto.builder()
                .submissionId(submissionId)
                .roomId(roomId)
                .status("SUCCESS")
                .score(score)
                .executionTimeMs(executionTime)
                .roomState(SubmissionRespDto.RoomState.builder()
                        .life(room.getLife())
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .roles(roles)
                .next(SubmissionRespDto.NextQuest.builder()
                        .hasNextQuest(true)
                        .nextQuestId(22L)
                        .build())
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
        int lifeAfter = room.getLife() - 1;

        return SubmissionRespDto.builder()
                .submissionId(submissionId)
                .roomId(roomId)
                .questId(questId)
                .status("FAIL")
                .score(score)
                .executionTimeMs(executionTime)
                .roomState(SubmissionRespDto.RoomState.builder()
                        .lifeAfter(lifeAfter)
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .errorLog((errorLog == null || errorLog.isEmpty()) ? "채점에 실패했습니다." : errorLog)
                .build();
    }
}