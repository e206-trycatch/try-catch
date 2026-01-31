package io.ssafy.trycatch.websocket.dto;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SocketRespDto<T> {     // 공통 응답 DTO
    private String type;
    private T data;
    private LocalDateTime timestamp;

    public static <T> SocketRespDto<T> of(String type, T data) {
        return new SocketRespDto<>(type, data, LocalDateTime.now());
    }
}