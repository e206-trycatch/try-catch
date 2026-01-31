package io.ssafy.trycatch.domain.submission.controller;

import io.ssafy.trycatch.domain.submission.service.SubmissionWebSocketService;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SubmissionWebSocketController {

    private final SubmissionWebSocketService submissionWebSocketService;
    private final SimpMessagingTemplate messagingTemplate;


    /**
     * 제출 시작 알림
     * 클라이언트 -> /app/room/{roomId}/submit/start
     * 브로드캐스트 -> /topic/room/{roomId}/game
     */
    @MessageMapping("/room/{roomId}/submit/start")
    public void notifySubmissionStart(
            @DestinationVariable Long roomId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        log.info("제출 시작 알림: roomId={}, userId={}", roomId, userId);

        submissionWebSocketService.validateHost(roomId, userId);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.SUBMISSION_STARTED, null)
        );
    }

    /**
     * 재도전 시작
     * 클라이언트 -> /app/room/{roomId}/retry
     * 브로드캐스트 -> /topic/room/{roomId}/game
     */
    @MessageMapping("/room/{roomId}/retry")
    public void retryQuest(
            @DestinationVariable Long roomId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        log.info("재도전 시작: roomId={}, userId={}", roomId, userId);

        submissionWebSocketService.validateHost(roomId, userId);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.RETRY_STARTED, null)
        );
    }
}