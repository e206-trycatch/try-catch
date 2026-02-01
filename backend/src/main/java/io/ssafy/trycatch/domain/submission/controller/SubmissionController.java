package io.ssafy.trycatch.domain.submission.controller;

import io.ssafy.trycatch.domain.room.dto.response.ProblemFilesRespDto;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionCompleteRespDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.service.SubmissionService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/api/v1/rooms/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.submit(roomId, userId, request))
        );
    }

    @GetMapping("/api/v1/rooms/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.getSubmission(roomId, userId))
        );
    }

    @PostMapping("/api/v1/rooms/multi/{roomId}/submissions")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submissionMulti(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {
        Long userId = getCurrentUserId();

        SubmissionRespDto response = submissionService.submit(roomId, userId, request);

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
}
