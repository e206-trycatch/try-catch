package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.entity.Submission;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.domain.submission.repository.SubmissionFileRepository;
import io.ssafy.trycatch.domain.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;

    @Transactional
    public SubmissionRespDto submit(Long roomId, Long userId, SubmissionReqDto request) {

        List<Submission> submissions = new ArrayList<>();

        // Frontend 제출 처리
        if (request.getFrontend() != null) {
            Submission frontendSubmission = createSubmission(
                    roomId,
                    userId,
                    request.getFrontend()
            );
            submissions.add(frontendSubmission);

            // Frontend 파일들 저장
            saveSubmissionFiles(frontendSubmission.getId(), request.getFrontend().getFiles());
        }

        // Backend 제출 처리
        if (request.getBackend() != null) {
            Submission backendSubmission = createSubmission(
                    roomId,
                    userId,
                    request.getBackend()
            );
            submissions.add(backendSubmission);

            // Backend 파일들 저장
            saveSubmissionFiles(backendSubmission.getId(), request.getBackend().getFiles());
        }

        // TODO: 채점 로직 (gpt API 호출)
        // ScoreResult scoreResult = scoreService.grade(submissions);

        // TODO: 채점 결과로 응답 생성
        return buildSuccessResponse(submissions.getFirst(), roomId);
    }

    private Submission createSubmission(Long roomId, Long userId, SubmissionReqDto.SubmissionItem item) {
        Submission submission = Submission.builder()
                .userId(userId)
                .roomId(roomId)
                .problemFrameworkId(item.getProblemFrameworkId())
                .status(Submission.Status.FAIL) // 초기값
                .build();

        return submissionRepository.save(submission);
    }

    private void saveSubmissionFiles(Long submissionId, List<SubmissionReqDto.FileItem> files) {
        List<SubmissionFile> submissionFiles = files.stream()
                .map(file -> SubmissionFile.builder()
                        .submissionId(submissionId)
                        .filePath(file.getFilePath())
                        .codeRole(determineCodeRole(file.getFilePath()))
                        .fileType(SubmissionFile.FileType.valueOf(file.getFileType()))
                        .code(file.getCode())
                        .build())
                .toList();

        submissionFileRepository.saveAll(submissionFiles);
    }

    private SubmissionFile.CodeRole determineCodeRole(String filePath) {
        if (filePath.contains("/frontend/")) {
            return SubmissionFile.CodeRole.FRONTEND;
        } else if (filePath.contains("/backend/")) {
            return SubmissionFile.CodeRole.BACKEND;
        }
        return SubmissionFile.CodeRole.FRONTEND;
    }

    private SubmissionRespDto buildSuccessResponse(Submission submission, Long roomId) {
        // TODO: 현재 임시 데이터
        return SubmissionRespDto.builder()
                .submissionId(submission.getId())
                .roomId(roomId)
                .status("SUCCESS")
                .score(90)
                .executionTimeMs(1281000L)
                .roomState(SubmissionRespDto.RoomState.builder()
                        .life(3)
                        .remainingHintCount(3)
                        .build())
                .roles(List.of(
                        SubmissionRespDto.RoleInfo.builder()
                                .role("FRONTEND")
                                .frameworkId(101L)
                                .build()
                ))
                .next(SubmissionRespDto.NextQuest.builder()
                        .hasNextQuest(true)
                        .nextQuestId(22L)
                        .build())
                .build();
    }
}