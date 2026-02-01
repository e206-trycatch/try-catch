package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class JoinedPlayerInfoDto {  // 입장한 플레이어 정보
    private Long userId;
    private String nickname;
    private String profileUrl;
    private String position;  // FRONTEND, BACKEND
    private Boolean isReady;
    private String role;      // HOST, GUEST
}