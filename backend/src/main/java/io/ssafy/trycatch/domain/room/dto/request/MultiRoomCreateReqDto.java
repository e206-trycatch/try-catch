package io.ssafy.trycatch.domain.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MultiRoomCreateReqDto {

    private Long themeId;
    private String roomName;

    // Host 정보
    private HostInfo host;

    // Guest 정보 (Host가 미리 지정)
    private GuestInfo guest;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostInfo {
        private Long frameworkId;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestInfo {
        private Long frameworkId;
    }
}