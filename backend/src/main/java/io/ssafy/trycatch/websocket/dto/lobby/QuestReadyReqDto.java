package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class QuestReadyReqDto {
    private Long questId;
}