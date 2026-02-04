package io.ssafy.trycatch.domain.hint.controller;


import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.domain.hint.dto.request.HintCreateReqDto;
import io.ssafy.trycatch.domain.hint.dto.response.HintHistoryRespDto;
import io.ssafy.trycatch.domain.hint.service.HintService;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionStartRespDto;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HintMultiController {

    private final HintService hintService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/rooms/multi/{roomId}/hints")
    public ResponseEntity<ApiRespDto<Map<String, String>>> createHintMulti(
            @PathVariable Long roomId,
            @RequestBody HintCreateReqDto requestDto,
            @AuthenticationPrincipal Long userId) {
        log.info("힌트 생성 요청 - roomId: {}, userId: {}, problemId: {}, question: {}",
                roomId, userId, requestDto.getProblemFrameworkId(), requestDto.getUserQuestion());

        // 1. 질문을 Redis에 저장
        hintService.saveQuestion(roomId, userId, requestDto.getUserQuestion());

        // 2. 질문 즉시 브로드캐스트
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(
                        SocketEventType.HINT_QUESTION,
                        Map.of(
                                "userId", userId,
                                "question", requestDto.getUserQuestion(),
                                "timestamp", System.currentTimeMillis()
                        )
                )
        );

        // 3. AI 힌트 생성 (비동기)
        CompletableFuture.runAsync(() -> {
            try {
                HintRespDto response = hintService.requestHint(
                        roomId,
                        userId,
                        requestDto.getProblemFrameworkId(),
                        requestDto.getFramework(),
                        requestDto.getUserQuestion(),
                        requestDto.getSubmission()
                );

                // 4. 응답 브로드캐스트
                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomId + "/game",
                        SocketRespDto.of(
                                SocketEventType.HINT_MESSAGE,
                                Map.of(
                                        "userId", userId,
                                        "success", response.isSuccess(),
                                        "hint", response.getHint() != null ? response.getHint() : "",
                                        "guardrailPassed", response.isGuardrailPassed(),
                                        "rejectionReason", response.getRejectionReason() != null ? response.getRejectionReason() : "",
                                        "timestamp", System.currentTimeMillis()
                                )
                        )
                );

//                log.info("힌트 생성 완료 - roomId: {}, success: {}", roomId, response.isSuccess());

            } catch (Exception e) {
                log.error("힌트 생성 실패 - roomId: {}, userId: {}", roomId, userId, e);

                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomId + "/game",
                        SocketRespDto.of(
                                SocketEventType.HINT_ERROR,
                                Map.of(
                                        "userId", userId,
                                        "message", "힌트 생성에 실패했습니다.",
                                        "timestamp", System.currentTimeMillis()
                                )
                        )
                );
            }
        });
        // 5. 즉시 응답
        return ResponseEntity.ok(ApiRespDto.success(Map.of(
                "status", "accepted",
                "message", "힌트 생성 중입니다..."
        )));
    }
}




