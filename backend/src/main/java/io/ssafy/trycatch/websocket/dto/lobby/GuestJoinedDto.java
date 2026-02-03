package io.ssafy.trycatch.websocket.dto.lobby;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GuestJoinedDto {
    private Long userId;
    private String nickname;
    private String profileUrl;
    private Long frameworkId;
    private String frameworkName;
    private Boolean isReady;
}
