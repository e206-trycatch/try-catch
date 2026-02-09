package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.entity.Theme;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ThemeListRespDto {

    private List<ThemeInfo> result;

    @Getter
    @Builder
    public static class ThemeInfo {
        private Long themeId;
        private String name;
        private String description;
        private String genre;
        private Integer level;
        private String themeImageUrl;
    }

    public static ThemeListRespDto success(List<Theme> themes) {
        List<ThemeInfo> themeInfos = themes.stream()
                .map(theme -> ThemeInfo.builder()
                        .themeId(theme.getThemeId())
                        .name(theme.getName())
                        .description(theme.getDescription())
                        .genre(theme.getGenre())
                        .level(theme.getLevel())
                        .themeImageUrl(theme.getThemeImageUrl())
                        .build())
                .collect(Collectors.toList());

        return ThemeListRespDto.builder()
                .result(themeInfos)
                .build();
    }
}
