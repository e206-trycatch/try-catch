package io.ssafy.trycatch.domain.submission.controller;

import io.ssafy.trycatch.domain.game.service.RetryService;
import io.ssafy.trycatch.domain.game.service.TimeoutSchedulerService;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFilesRespDto;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionCompleteRespDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionStartRespDto;
import io.ssafy.trycatch.domain.submission.service.SubmissionService;
import io.ssafy.trycatch.domain.submission.service.SubmissionWebSocketService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SubmissionWebSocketService submissionWebSocketService;
    private final TimeoutSchedulerService timeoutSchedulerService;
    private final RetryService retryService;

    @PostMapping("/api/v1/rooms/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {
        Long userId = getCurrentUserId();
        LocalDateTime submittedAt = LocalDateTime.now();
        timeoutSchedulerService.cancelTimeout(roomId); // 타임아웃 취소 처리
        SubmissionRespDto response = submissionService.submit(roomId, userId, request, submittedAt);
        return ResponseEntity.ok(
                ApiRespDto.success(response)
        );
    }

    @GetMapping("/api/v1/rooms/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.getLatestSubmission(roomId, userId))
        );
    }

    @GetMapping("/api/v1/rooms/{roomId}/submissions/{submissionId}/result")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submissionById(
            @PathVariable Long roomId,
            @PathVariable Long submissionId) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.getSubmission(roomId, submissionId, userId))
        );
    }

    @PostMapping("/api/v1/rooms/multi/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submissionMulti(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {
        Long userId = getCurrentUserId();

        // 제출 시각
        LocalDateTime submittedAt = LocalDateTime.now();
        submissionWebSocketService.validateHost(roomId, userId);

        SubmissionStartRespDto startDto = SubmissionStartRespDto.builder()
                .roomId(roomId)
                .submittedAt(submittedAt).build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.SUBMISSION_STARTED, startDto)
        );

        timeoutSchedulerService.cancelTimeout(roomId); // 타임아웃 취소 처리
        SubmissionRespDto response = submissionService.submit(roomId, userId, request, submittedAt);

        // 2. WebSocket으로 "제출 완료" 신호 브로드캐스트
        SubmissionCompleteRespDto completeDto = SubmissionCompleteRespDto.builder()
                .submissionId(response.getSubmissionId())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.SUBMISSION_COMPLETED, completeDto)
        );

        log.info("제출 완료 신호 브로드캐스트: roomId={}, submissionId={}",
                roomId, response.getSubmissionId());

        return ResponseEntity.ok(ApiRespDto.success(response));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }

    /**
     * 재도전을 위한 문제 파일 조회
     */
    @GetMapping("/api/v1/rooms/{roomId}/submissions/{submissionId}")
    public ResponseEntity<ApiRespDto<ProblemFilesRespDto>> getProblemFiles(
            @PathVariable Long roomId,
            @PathVariable Long submissionId) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(
                        "문제 파일 목록을 불러왔습니다.",
                        submissionService.getProblemFilesForRetry(roomId, submissionId, userId)
                )
        );
    }

    @PostMapping("/api/v1/rooms/multi/{roomId}/retry")
    public ResponseEntity<ApiRespDto<Void>> retryGame(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {

        submissionWebSocketService.validateHost(roomId, userId);

        retryService.retryGame(roomId, userId);
        // 모든 유저에게 재도전 시작 브로드캐스트
        RetryStartedRespDto data = RetryStartedRespDto.builder()
                .roomId(roomId)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.RETRY_STARTED, data)
        );

        log.info("재도전 시작 브로드캐스트 완료 - roomId: {}", roomId);

        return ResponseEntity.ok(ApiRespDto.success(null));
    }
}
