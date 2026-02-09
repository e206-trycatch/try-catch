package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// 준비 상태 변경
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ReadyStatusDto {
    private Long userId;
    private Boolean isReady;
}