package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto.FrameworkInfo;
import io.ssafy.trycatch.domain.room.entity.Framework;
import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.domain.room.repository.FrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.ThemeRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SingleRoomService {

    private final ThemeRepository themeRepository;
    private final FrameworkRepository frameworkRepository;

    public SingleRoomSettingRespDto getSingleRoomSettings(Long themeId) {
        Theme selectedTheme = getThemeById(themeId);
        Map<String, List<FrameworkInfo>> availableFrameworks = getAvailableFrameworks();
        SingleRoomSettingRespDto response = SingleRoomSettingRespDto.builder()
                .themeId(selectedTheme.getThemeId().intValue())
                .themeName(selectedTheme.getName())
                .availableFrameworks(availableFrameworks)
                .build();

        return response;
    }

    private Theme getThemeById(Long themeId) {
        return themeRepository.findById(themeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 테마입니다. themeId: " + themeId));
    }

    private Map<String, List<FrameworkInfo>> getAvailableFrameworks() {
        List<Framework> frameworks = frameworkRepository.findAllByIsDeleted(TrueOrFalse.F);

        Map<String, List<FrameworkInfo>> frameworkMap = new HashMap<>();

        List<FrameworkInfo> frontendFrameworks = frameworks.stream()
                .filter(f -> "FRONTEND".equals(f.getCategory()))
                .map(f -> FrameworkInfo.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .build())
                .collect(Collectors.toList());

        List<FrameworkInfo> backendFrameworks = frameworks.stream()
                .filter(f -> "BACKEND".equals(f.getCategory()))
                .map(f -> FrameworkInfo.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .build())
                .collect(Collectors.toList());

        frameworkMap.put("FRONTEND", frontendFrameworks);
        frameworkMap.put("BACKEND", backendFrameworks);

        return frameworkMap;
    }
}