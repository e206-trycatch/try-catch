package io.ssafy.trycatch.websocket.interceptor;

import io.ssafy.trycatch.global.auth.jwt.JwtTokenProvider;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {
// stomp 메시지가 서버로 들어오기전에 거치는 필터
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        /* preSend() : stomp 메시지가 서버로 도착할때마다 호출
            (STOMP 메시지 종류) : (시점)
            - CONNECT : 최초 연결
            - SUBSCRIBE : 토픽 구독
            - SEND : 메시지 전송
            - DISCONNECT : 연결 해제
         */
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            String token = extractToken(accessor);

            if (token == null) {
                log.warn("WebSocket 연결 실패: 토큰 없음");
                throw new IllegalArgumentException("JWT 토큰이 필요합니다.");
            }

            if (!jwtTokenProvider.validateToken(token)) {
                log.warn("WebSocket 연결 실패: 유효하지 않은 토큰");
                throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
            }

            Long userId = jwtTokenProvider.getUserId(token);
            accessor.getSessionAttributes().put("userId", userId);
            log.info("WebSocket 연결 성공: userId={}", userId);
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
