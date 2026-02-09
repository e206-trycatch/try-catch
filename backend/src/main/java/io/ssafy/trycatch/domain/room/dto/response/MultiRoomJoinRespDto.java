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
public class MultiRoomJoinRespDto {

    private Long roomId;
    private String roomName;
    private GuestInfo guest;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestInfo {
        private Long userId;
        private RoomPosition position;
        private Long frameworkId;
        private String frameworkName;
    }
}