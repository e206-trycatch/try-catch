package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// 퇴장
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PlayerLeftDto {
    private Long userId;
    private String nickname;
}