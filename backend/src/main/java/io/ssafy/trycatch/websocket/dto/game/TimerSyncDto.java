package io.ssafy.trycatch.websocket.dto.game;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TimerSyncDto {
    private Long remainingSeconds;
}