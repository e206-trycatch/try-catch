package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class QuestReadyStatusDto {
    private PlayerReadyInfo host;
    private PlayerReadyInfo guest;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PlayerReadyInfo {
        private Long userId;
        private Boolean isReady;
    }
}