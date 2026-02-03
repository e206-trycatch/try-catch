package io.ssafy.trycatch.websocket.dto.game;

import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimerStartedDto {
    private Long roomId;
    private LocalDateTime startedAt;
    private LocalDateTime deadlineAt;
}