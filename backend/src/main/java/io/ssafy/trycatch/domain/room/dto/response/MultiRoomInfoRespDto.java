package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiRoomInfoRespDto {

    private Long roomId;
    private String roomName;
    private String invitationCode;
    private Integer themeId;
    private String themeName;
    private RoomStatus roomStatus;
    private ParticipantInfo host;
    private ParticipantInfo guest;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long userId;
        private String nickname;
        private RoomPosition position;
        private Long frameworkId;
        private String frameworkName;
        private Boolean isReady;
    }
}