package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFilesRespDto;
import io.ssafy.trycatch.domain.room.entity.*;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.domain.room.repository.*;
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
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.ssafy.trycatch.global.exception.ErrorCode.*;

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
    private final FrameworkRepository frameworkRepository;
    private final RoomUserRepository roomUserRepository;
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

    @Transactional
    public SubmissionRespDto submit(Long roomId, Long userId, SubmissionReqDto request, LocalDateTime submittedAt) {
        // 1단계: DB 작업 (트랜잭션 내)
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        SubmissionContext context = transactionTemplate.execute(status ->
                createSubmissions(roomId, userId, request, submittedAt)
        );
        if (context == null) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR); // 네 에러코드에 맞게
        }
        Room room = context.getRoom();

        // 2단계: GPT 채점 (트랜잭션 밖 - 외부 API 호출)
        List<ScoreResult> scoreResults = scoreSubmissions(context, room);

        // 3단계: 결과 업데이트 및 응답 생성 (트랜잭션 내)
        return updateAndBuildResponse(context, scoreResults);
    }

    @Transactional(readOnly = true)
    public SubmissionRespDto getLatestSubmission(Long roomId, Long userId) {
        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 2. Room에 유저가 있는지 체크
        roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(USER_NOT_IN_ROOM));

        // 3. 해당 방의 가장 최근 제출 조회
        Submission submission = submissionRepository
                .findTopByRoomIdOrderBySubmittedAtDesc(roomId)
                .orElseThrow(() -> new CustomException(SUBMISSION_NOT_FOUND));

        if (submission.getProcessingStatus() == Submission.ProcessingStatus.PENDING) {
            return SubmissionRespDto.builder()
                    .submissionId(submission.getId())
                    .roomId(roomId)
                    .status("PENDING")
                    .build();
        }

        // 4. ProblemFramework → Quest 조회
        ProblemFramework problemFramework = problemFrameworkRepository
                .findById(submission.getProblemFrameworkId())
                .orElseThrow(() -> new CustomException(PROBLEM_FRAMEWORK_NOT_FOUND));

        Quest quest = questRepository.findById(problemFramework.getQuestId())
                .orElseThrow(() -> new CustomException(QUEST_NOT_FOUND));

        // 5. 다음 퀘스트 조회
        Optional<Quest> nextQuest = questRepository
                .findByThemeIdAndQuestOrder(quest.getThemeId(), quest.getQuestOrder() + 1);

        // 6. Roles 구성
        List<SubmissionRespDto.RoleInfo> roles = List.of(
                SubmissionRespDto.RoleInfo.builder()
                        .role("FRONTEND")
                        .frameworkId(problemFramework.getFrontendId())
                        .build(),
                SubmissionRespDto.RoleInfo.builder()
                        .role("BACKEND")
                        .frameworkId(problemFramework.getBackendId())
                        .build()
        );

        // 7. 응답 생성
        if (submission.getStatus() == Submission.Status.SUCCESS) {
            return buildSuccessResponse(submission, room, quest, roles,
                    nextQuest.isPresent(), nextQuest.map(Quest::getId).orElse(null));
        } else {
            return buildFailResponse(submission, room, quest);
        }
    }

    @Transactional(readOnly = true)
    public SubmissionRespDto getSubmission(Long roomId, Long submissionId, Long userId) {
        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 2. Room에 유저가 있는지 체크
        roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(USER_NOT_IN_ROOM));

        // 3. Submission 조회
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new CustomException(SUBMISSION_NOT_FOUND));

        if (submission.getProcessingStatus() == Submission.ProcessingStatus.PENDING) {
            return SubmissionRespDto.builder()
                    .submissionId(submission.getId())
                    .roomId(roomId)
                    .status("PENDING")
                    .build();
        }

        // 4. ProblemFramework → Quest 조회
        ProblemFramework problemFramework = problemFrameworkRepository
                .findById(submission.getProblemFrameworkId())
                .orElseThrow(() -> new CustomException(PROBLEM_FRAMEWORK_NOT_FOUND));

        Quest quest = questRepository.findById(problemFramework.getQuestId())
                .orElseThrow(() -> new CustomException(QUEST_NOT_FOUND));

        // 5. 다음 퀘스트 조회
        Optional<Quest> nextQuest = questRepository
                .findByThemeIdAndQuestOrder(quest.getThemeId(), quest.getQuestOrder() + 1);

        boolean hasNextQuest = nextQuest.isPresent();
        Long nextQuestId = nextQuest.map(Quest::getId).orElse(null);

        // 6. Roles 구성
        List<SubmissionRespDto.RoleInfo> roles = List.of(
                SubmissionRespDto.RoleInfo.builder()
                        .role("FRONTEND")
                        .frameworkId(problemFramework.getFrontendId())
                        .build(),
                SubmissionRespDto.RoleInfo.builder()
                        .role("BACKEND")
                        .frameworkId(problemFramework.getBackendId())
                        .build()
        );

        if (submission.getStatus() == Submission.Status.SUCCESS) {
            return buildSuccessResponse(submission, room, quest, roles, hasNextQuest, nextQuestId);
        } else {
            return buildFailResponse(submission, room, quest);
        }
    }

    private SubmissionRespDto buildSuccessResponse(
            Submission submission, Room room, Quest quest,
            List<SubmissionRespDto.RoleInfo> roles, boolean hasNextQuest, Long nextQuestId) {

        return SubmissionRespDto.builder()
                .submissionId(submission.getId())
                .roomId(room.getId())
                .questId(quest.getId())
                .questOrder(quest.getQuestOrder())
                .status("SUCCESS")
                .score(submission.getScore())
                .executionTimeMs(submission.getExecutionTime())
                .roomState(SubmissionRespDto.RoomState.builder()
                        .remainingLife(room.getLife())
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .roles(roles)
                .next(SubmissionRespDto.NextQuest.builder()
                        .hasNextQuest(hasNextQuest)
                        .nextQuestId(nextQuestId)
                        .build())
                .build();
    }

    private SubmissionRespDto buildFailResponse(
            Submission submission, Room room, Quest quest) {

        return SubmissionRespDto.builder()
                .submissionId(submission.getId())
                .roomId(room.getId())
                .questId(quest.getId())
                .questOrder(quest.getQuestOrder())
                .status("FAIL")
                .score(submission.getScore())
                .executionTimeMs(submission.getExecutionTime())
                .roomState(SubmissionRespDto.RoomState.builder()
                        .remainingLife(room.getLife())
                        .remainingHintCount(room.getRemainingHintCount())
                        .build())
                .errorLog(submission.getErrorLog())
                .build();
    }

    @Transactional
    public SubmissionContext createSubmissions(Long roomId, Long userId, SubmissionReqDto request, LocalDateTime submittedAt) {
//        Room room = roomRepository.findById(roomId)
//                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        if (room.getLife() <= 0) {
            throw new CustomException(ErrorCode.GAMEOVER);
        }

        log.info("createSubmissions roomId: {}, probelFrameworkId: {}", roomId, request.getProblemFrameworkId());
        // 중복 방지 로직
        boolean hasPending = submissionRepository
                .existsByRoomIdAndUserIdAndProblemFrameworkIdAndProcessingStatus(
                        roomId, userId, request.getProblemFrameworkId(), Submission.ProcessingStatus.PENDING
                );
        if (hasPending) {
            throw new CustomException(SUBMISSION_ALREADY_PENDING);
        }

        SubmissionContext context = new SubmissionContext(room);

        Long problemFrameworkId = request.getProblemFrameworkId();

        boolean hasFrontend = request.getFrontend() != null
                && request.getFrontend().getFiles() != null
                && !request.getFrontend().getFiles().isEmpty();

        boolean hasBackend = request.getBackend() != null
                && request.getBackend().getFiles() != null
                && !request.getBackend().getFiles().isEmpty();

        if (!hasFrontend && !hasBackend) {
            throw new CustomException(SUBMISSION_NOT_FOUND);
        }

        if (hasFrontend && hasBackend) {
            // 풀스택: 둘 다 저장
            processFullstackSubmission(roomId, userId, request, problemFrameworkId, context, submittedAt);
//            processRoleSubmission(roomId, userId, request.getFrontend(), "FRONTEND", problemFrameworkId, context);
//            processRoleSubmission(roomId, userId, request.getBackend(), "BACKEND", problemFrameworkId, context);
            return context;
        }

        if (hasFrontend) {
            processRoleSubmission(roomId, userId, request.getFrontend(), "FRONTEND", problemFrameworkId, context, submittedAt);
            return context;
        }

        // hasBackend
        processRoleSubmission(roomId, userId, request.getBackend(), "BACKEND", problemFrameworkId, context, submittedAt);

        return context;
    }

    private void processRoleSubmission(
            Long roomId,
            Long userId,
            SubmissionReqDto.SubmissionItem item,
            String roleName,
            Long problemFrameworkId,
            SubmissionContext context,
            LocalDateTime submittedAt
    ) {
        // Submission 생성 및 저장
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(problemFrameworkId)
                .status(Submission.Status.FAIL)
                .submittedAt(submittedAt)
                .build();
        submission = submissionRepository.save(submission);

        // SubmissionFile 저장
        List<SubmissionFile> files = saveSubmissionFiles(submission.getId(), item.getFiles());

        // Context에 정보 저장
        context.addSubmission(submission, files, roleName, problemFrameworkId);
    }

    private List<SubmissionFile> saveSubmissionFiles(Long submissionId, List<SubmissionReqDto.FileItem> files) {
        if (files == null || files.isEmpty())  return List.of();

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

    private void processFullstackSubmission(
            Long roomId,
            Long userId,
            SubmissionReqDto request,
            Long problemFrameworkId,
            SubmissionContext context,
            LocalDateTime submittedAt
    ) {
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(problemFrameworkId)
                .status(Submission.Status.FAIL)
                .submittedAt(submittedAt)
                .build();
        submission = submissionRepository.save(submission);

        List<SubmissionFile> frontendFiles = saveSubmissionFiles(
                submission.getId(),
                request.getFrontend().getFiles()
        );

        // ✅ 백 파일 저장 (codeRole=BACKEND 강제)
        List<SubmissionFile> backendFiles = saveSubmissionFiles(
                submission.getId(),
                request.getBackend().getFiles()
        );

        // ✅ context에는 "FULLSTACK"으로 1개만 넣어도 되고,
        // 또는 roles 응답을 위해 FRONTEND/BACKEND 둘 다 넣고 싶으면 context 구조를 바꿔야 함.
        // 여기서는 일단 submissionData 1개로 관리 (roleName="FULLSTACK")
        List<SubmissionFile> allFiles = new ArrayList<>();
        allFiles.addAll(frontendFiles);
        allFiles.addAll(backendFiles);

        context.addSubmission(submission, allFiles, "FULLSTACK", problemFrameworkId);
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
        List<SubmissionContext.SubmissionData> dataList = context.getSubmissionDataList();

        if (dataList.size() == 1 && dataList.get(0).getRoleName().equals("FULLSTACK")) {
            SubmissionContext.SubmissionData fullstackData = dataList.get(0);

            // 파일을 Frontend/Backend로 분리
            List<SubmissionFile> frontendFiles = fullstackData.getFiles().stream()
                    .filter(f -> f.getCodeRole() == SubmissionFile.CodeRole.FRONTEND)
                    .toList();

            List<SubmissionFile> backendFiles = fullstackData.getFiles().stream()
                    .filter(f -> f.getCodeRole() == SubmissionFile.CodeRole.BACKEND)
                    .toList();

            ScoreResult fullstackScore = scoreFullstackIntegrated(
                    fullstackData.getFrameworkId(),
                    frontendFiles,
                    backendFiles,
                    room,
                    context.getSubmissions().getFirst().getSubmittedAt()
            );

            return List.of(fullstackScore);
        }

        // Frontend와 Backend 데이터 분리
        SubmissionContext.SubmissionData frontendData = dataList.stream()
                .filter(d -> d.getRoleName().equals("FRONTEND"))
                .findFirst()
                .orElse(null);

        SubmissionContext.SubmissionData backendData = dataList.stream()
                .filter(d -> d.getRoleName().equals("BACKEND"))
                .findFirst()
                .orElse(null);

        // Frontend만 있는 경우
        if (frontendData != null) {
            ScoreResult frontendScore = scoreSingleRole(frontendData, room);
            return List.of(frontendScore);
        }

        // Backend만 있는 경우
        if (backendData != null) {
            ScoreResult backendScore = scoreSingleRole(backendData, room);
            return List.of(backendScore);
        }

        // 둘 다 없는 경우 (에러)
        return List.of(ScoreResult.builder()
                .success(false)
                .score(0)
                .errorLog("제출된 코드가 없습니다.")
                .executionTime(0L)
                .build());
    }

    /**
     * Fullstack 통합 채점
     */
    private ScoreResult scoreFullstackIntegrated(
            Long problemFrameworkId,
            List<SubmissionFile> frontendFiles,
            List<SubmissionFile> backendFiles,
            Room room,
            LocalDateTime submittedAt) {

        ProblemFramework problemFramework = problemFrameworkRepository
                .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.PROBLEM_FRAMEWORK_NOT_FOUND));

        Long frontendId = problemFramework.getFrontendId();
        Long backendId = problemFramework.getBackendId();

        if (frontendId == null || backendId == null) {
            throw new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND);
        }

        Framework frontendFramework = frameworkRepository.findById(frontendId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));
        Framework backendFramework = frameworkRepository.findById(backendId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));

        String problemDoc = getProblemDoc(problemFrameworkId);
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

    /**
     * 단일 역할(Frontend 또는 Backend) 채점
     */
    private ScoreResult scoreSingleRole(SubmissionContext.SubmissionData data, Room room) {
        Long problemFrameworkId = data.getFrameworkId();
        log.info("problemFrameworkId: {}", problemFrameworkId);
        ProblemFramework problemFramework = problemFrameworkRepository
                .findByIdAndIsDeleted(problemFrameworkId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.PROBLEM_FRAMEWORK_NOT_FOUND));

        String expectedFramework;
        String expectedLanguage;

        if (data.getRoleName().equals("FRONTEND")) {
            Long frontendId = problemFramework.getFrontendId();
            log.info("problemFrameworkId: {}, framework: {}", problemFrameworkId, frontendId);
            if (frontendId == null) {
                throw new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND);
            }

            Framework framework = frameworkRepository.findById(frontendId)
                    .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));
            expectedFramework = framework.getName();
            expectedLanguage = framework.getLanguage();
        } else {
            Long backendId = problemFramework.getBackendId();
            log.info("problemFrameworkId: {}, framework: {}", problemFrameworkId, backendId);
            if (backendId == null) {
                throw new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND);
            }

            Framework framework = frameworkRepository.findById(backendId)
                    .orElseThrow(() -> new CustomException(ErrorCode.FRAMEWORK_NOT_FOUND));
            expectedFramework = framework.getName();
            expectedLanguage = framework.getLanguage();
        }

        String problemDoc = getProblemDoc(problemFrameworkId);
        String submittedSource = combineSource(data.getFiles());
        String rubric = data.getRoleName().equals("FRONTEND") ? FRONTEND_RUBRIC : BACKEND_RUBRIC;

        return gptScoringService.scoreQuality(
                problemDoc,
                submittedSource,
                rubric,
                data.getRoleName(),
                expectedFramework,
                expectedLanguage,
                room,
                data.getSubmission().getSubmittedAt()
        );
    }

    @Transactional
    public SubmissionRespDto updateAndBuildResponse(
            SubmissionContext context,
            List<ScoreResult> scoreResults
    ) {
        Submission submissions = context.getSubmissions().get(0);
        List<SubmissionRespDto.RoleInfo> roles = new ArrayList<>();

        // 각 Submission 결과 업데이트
        Long submissionId = submissions.getId();

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new CustomException(SUBMISSION_NOT_FOUND));

        ScoreResult score = scoreResults.get(0);
        SubmissionContext.SubmissionData data = context.getSubmissionDataList().get(0);

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

        Room room = roomRepository.findByIdForUpdate(context.getRoom().getId())
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        Long problemFrameworkId = submission.getProblemFrameworkId();
        Long currentQuestId = getCurrentQuestId(problemFrameworkId);
        Integer currentQuestOrder = getCurrentQuestOrder(problemFrameworkId);

        if (allSuccess) {
            return buildSuccessResponse(
                    submission.getId(),
                    room.getId(),
                    currentQuestId,
                    currentQuestOrder,
                    averageScore,
                    totalExecutionTime,
                    room,
                    roles
            );
        } else {
            room.decreaseLife();
            return buildFailResponse(
                    submission.getId(),
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

        // 5. Frontend/Backend 에러 로그 분리
        String frontendErrorLog = null;
        String backendErrorLog = null;

        for (Submission sub : allSubmissions) {
            List<SubmissionFile> files = submissionFileRepository
                    .findBySubmissionIdAndIsDeleted(sub.getId(), TrueOrFalse.F);

            boolean isFrontend = files.stream()
                    .anyMatch(f -> f.getCodeRole() == SubmissionFile.CodeRole.FRONTEND);

            if (isFrontend) {
                frontendErrorLog = sub.getErrorLog();
            } else {
                backendErrorLog = sub.getErrorLog();
            }
        }

        // 6. 제출 파일들 조회 (SOURCE, CONFIG 등)
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

        // 7. DOC 파일 조회 (ProblemFile에서)
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

        // 8. 모든 파일 합치기 (제출 파일 + DOC 파일)
        List<ProblemFileRespDto> allFiles = new ArrayList<>();
        allFiles.addAll(submittedFiles);
        allFiles.addAll(docFileDtos);

        // 9. 응답 생성
        return ProblemFilesRespDto.builder()
                .problemFrameworkId(problemFrameworkId)
                .frontendErrorLog(frontendErrorLog)
                .backendErrorLog(backendErrorLog)
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