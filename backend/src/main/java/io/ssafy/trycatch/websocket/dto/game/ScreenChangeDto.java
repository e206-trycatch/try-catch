package io.ssafy.trycatch.websocket.dto.game;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// 화면 전환
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ScreenChangeDto {
    private String screenType;
        // SUBMITTING, RESULT, RETRY, NEXT_QUEST << Enum으로 만들기
}
