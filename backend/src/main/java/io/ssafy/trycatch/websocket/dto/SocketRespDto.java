package io.ssafy.trycatch.websocket.dto;

import io.ssafy.trycatch.websocket.common.SocketEventType;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SocketRespDto<T> {     // 공통 응답 DTO
    private SocketEventType type;  // String -> SocketEventType
    private T data;
    private LocalDateTime timestamp;

    public static <T> SocketRespDto<T> of(SocketEventType type, T data) {
        return new SocketRespDto<>(type, data, LocalDateTime.now());
    }
}