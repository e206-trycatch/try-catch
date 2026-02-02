package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.websocket.common.SocketEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeOutEventDto {
    private Long roomId;
    private String message;
    private LocalDateTime deadlineAt;
}