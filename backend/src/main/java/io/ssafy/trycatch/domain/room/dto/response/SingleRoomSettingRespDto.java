package io.ssafy.trycatch.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SingleRoomSettingRespDto {

    private Integer themeId;

    private String themeName;

    private Map<String, List<FrameworkInfo>> availableFrameworks;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrameworkInfo {
        private Long id;
        private String name;
    }
}