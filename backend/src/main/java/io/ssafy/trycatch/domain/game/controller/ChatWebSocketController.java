package io.ssafy.trycatch.domain.game.controller;

import io.ssafy.trycatch.domain.game.dto.request.ChatMessageReqDto;
import io.ssafy.trycatch.domain.game.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * WebSocket을 통한 채팅 메시지 전송
     * 클라이언트 → 서버: /app/chat/{roomId}
     * 서버 → 클라이언트: /topic/room/{roomId}/game (SocketEventType.CHAT_MESSAGE)
     */
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,
                            @Payload ChatMessageReqDto request,
                            SimpMessageHeaderAccessor headerAccessor) {
        // 세션에서 사용자 ID 추출
        Long senderId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (senderId == null) {
            log.error("WebSocket 세션에 userId가 없습니다.");
            return;
        }

        // 메시지 전송 (내부적으로 WebSocket 브로드캐스트 포함)
        chatService.sendMessage(roomId, senderId, request);
    }
}




