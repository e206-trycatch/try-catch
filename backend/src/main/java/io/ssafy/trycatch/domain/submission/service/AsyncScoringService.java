package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.entity.Framework;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.repository.FrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.domain.room.repository.ProblemFrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.submission.dto.response.ScoreResult;
import io.ssafy.trycatch.domain.submission.entity.Submission;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.domain.submission.repository.SubmissionFileRepository;
import io.ssafy.trycatch.domain.submission.repository.SubmissionRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncScoringService {

    private final GptScoringService gptScoringService;
    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final RoomRepository roomRepository;
    private final ProblemFrameworkRepository problemFrameworkRepository;
    private final ProblemFileRepository problemFileRepository;
    private final FrameworkRepository frameworkRepository;
    private final TransactionTemplate transactionTemplate;

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

    @Async("scoringExecutor")
    public void scoreAsync(
            Long submissionId,
            Long roomId,
            String roleName,
            Long problemFrameworkId,
            LocalDateTime submittedAt
    ) {
        log.info("비동기 채점 시작 - submissionId: {}, roomId: {}, role: {}", submissionId, roomId, roleName);

        try {
            // 1. 필요한 데이터 조회 (짧은 읽기 트랜잭션)
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

            List<SubmissionFile> files = submissionFileRepository
                    .findBySubmissionIdAndIsDeleted(submissionId, TrueOrFalse.F);

            ProblemFramework problemFramework = problemFrameworkRepository
                    .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                    .orElseThrow(() -> new CustomException(ErrorCode.PROBLEM_FRAMEWORK_NOT_FOUND));

            String problemDoc = getProblemDoc(problemFrameworkId);

            // 2. GPT 채점 (트랜잭션 밖 - 오래 걸림)
            ScoreResult scoreResult;
            if (roleName.equals("FULLSTACK")) {
                scoreResult = scoreFullstack(files, problemFramework, problemDoc, room, submittedAt);
            } else {
                scoreResult = scoreSingleRole(files, problemFramework, problemDoc, roleName, room, submittedAt);
            }

            // 3. 결과 저장 (짧은 쓰기 트랜잭션)
            updateResult(submissionId, roomId, scoreResult);

            log.info("비동기 채점 완료 - submissionId: {}, success: {}, score: {}",
                    submissionId, scoreResult.getSuccess(), scoreResult.getScore());

        } catch (Exception e) {
            log.error("비동기 채점 실패 - submissionId: {}", submissionId, e);
            markAsFailed(submissionId, roomId, e.getMessage());
        }
    }

    private ScoreResult scoreFullstack(
            List<SubmissionFile> files,
            ProblemFramework problemFramework,
            String problemDoc,
            Room room,
            LocalDateTime submittedAt
    ) {
        List<SubmissionFile> frontendFiles = files.stream()
                .filter(f -> f.getCodeRole() == SubmissionFile.CodeRole.FRONTEND)
                .toList();

        List<SubmissionFile> backendFiles = files.stream()
                .filter(f -> f.getCodeRole() == SubmissionFile.CodeRole.BACKEND)
                .toList();

        Long frontendId = problemFramework.getFrontendId();
        Long backendId = problemFramework.getBackendId();

        if (frontendId == null || backendId == null) {
            throw new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND);
        }

        Framework frontendFramework = frameworkRepository.findById(frontendId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));
        Framework backendFramework = frameworkRepository.findById(backendId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));

        String frontendCode = combineSource(frontendFiles);
        String backendCode = combineSource(backendFiles);

        return gptScoringService.scoreFullstackIntegrated(
                problemDoc,
                frontendCode,
                backendCode,
                frontendFramework.getName(),
                frontendFramework.getLanguage(),
                backendFramework.getName(),
                backendFramework.getLanguage(),
                room,
                submittedAt
        );
    }

    private ScoreResult scoreSingleRole(
            List<SubmissionFile> files,
            ProblemFramework problemFramework,
            String problemDoc,
            String roleName,
            Room room,
            LocalDateTime submittedAt
    ) {
        Long frameworkId = roleName.equals("FRONTEND")
                ? problemFramework.getFrontendId()
                : problemFramework.getBackendId();

        if (frameworkId == null) {
            throw new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND);
        }

        Framework framework = frameworkRepository.findById(frameworkId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));

        String submittedSource = combineSource(files);
        String rubric = roleName.equals("FRONTEND") ? FRONTEND_RUBRIC : BACKEND_RUBRIC;

        return gptScoringService.scoreQuality(
                problemDoc,
                submittedSource,
                rubric,
                roleName,
                framework.getName(),
                framework.getLanguage(),
                room,
                submittedAt
        );
    }

    public void updateResult(Long submissionId, Long roomId, ScoreResult scoreResult) {
        transactionTemplate.executeWithoutResult(status -> {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new CustomException(ErrorCode.SUBMISSION_NOT_FOUND));

            Room room = roomRepository.findByIdForUpdate(roomId)
                    .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

            submission.updateResult(
                    Boolean.TRUE.equals(scoreResult.getSuccess()) ? Submission.Status.SUCCESS : Submission.Status.FAIL,
                    scoreResult.getExecutionTime(),
                    scoreResult.getFrontendErrorLog(),
                    scoreResult.getBackendErrorLog(),
                    scoreResult.getErrorLog(),
                    scoreResult.getScore()
            );

            if (!Boolean.TRUE.equals(scoreResult.getSuccess())) {
                room.decreaseLife();
            }

            room.endTimer();
        });
    }

    public void markAsFailed(Long submissionId, Long roomId, String errorMessage) {
        transactionTemplate.executeWithoutResult(status -> {
            Submission submission = submissionRepository.findById(submissionId).orElse(null);
            if (submission != null) {
                submission.updateResult(
                        Submission.Status.FAIL,
                        0L,
                        null,
                        null,
                        "채점 시스템 오류: " + errorMessage,
                        0
                );
            }

            Room room = roomRepository.findByIdForUpdate(roomId).orElse(null);
            if (room != null) {
                room.decreaseLife();
                room.endTimer();
            }
        });
    }

    private String getProblemDoc(Long problemFrameworkId) {
        List<ProblemFile> docFiles = problemFileRepository
                .findByProblemFrameworkIdAndFileTypeAndIsDeleted(
                        problemFrameworkId, FileType.DOC, TrueOrFalse.F
                );

        return docFiles.stream()
                .map(file -> String.format("## DOC: %s\n%s\n\n", safe(file.getFilePath()), safe(file.getCode())))
                .collect(Collectors.joining());
    }

    private String combineSource(List<SubmissionFile> files) {
        return files.stream()
                .filter(f -> f.getFileType() == SubmissionFile.FileType.SOURCE)
                .map(f -> String.format("// File: %s\n%s\n\n", safe(f.getFilePath()), safe(f.getCode())))
                .collect(Collectors.joining());
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}