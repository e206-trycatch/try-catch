package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiRoomCreateRespDto {

    private Long roomId;
    private String invitationCode;
    private String roomName;
    private Long themeId;
    private HostInfo host;
    private GuestInfo guest;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostInfo {
        private Long frameworkId;
        private String frameworkName;
        private RoomPosition role;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestInfo {
        private Long frameworkId;
        private String frameworkName;
        private RoomPosition role;
    }
}