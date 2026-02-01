package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.response.MultiRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.dto.response.MultiRoomSettingRespDto.FrameworkInfo;
import io.ssafy.trycatch.domain.room.entity.Framework;
import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
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
public class MultiRoomService {

    private final ThemeRepository themeRepository;
    private final FrameworkRepository frameworkRepository;

    public MultiRoomSettingRespDto getMultiRoomSettings(Long themeId) {
        // 1. 테마 조회
        Theme selectedTheme = getThemeById(themeId);

        // 2. 사용 가능한 프레임워크 목록 조회 (FRONTEND/BACKEND로 그룹화)
        Map<String, List<FrameworkInfo>> availableFrameworks = getAvailableFrameworks();

        // 3. Response 생성
        MultiRoomSettingRespDto response = MultiRoomSettingRespDto.builder()
                .themeId(selectedTheme.getThemeId().longValue())
                .themeName(selectedTheme.getName())
                .availableFrameworks(availableFrameworks)
                .build();

        log.info("멀티 방 설정 정보 조회 완료 - themeId: {}, themeName: {}",
                selectedTheme.getThemeId(), selectedTheme.getName());

        return response;
    }

    // 테마 조회
    private Theme getThemeById(Long themeId) {
        return themeRepository.findById(themeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 테마입니다. themeId: " + themeId));
    }

    // 사용 가능한 프레임워크 목록 조회 및 그룹화
    private Map<String, List<FrameworkInfo>> getAvailableFrameworks() {
        // 삭제되지 않은 모든 프레임워크 조회
        List<Framework> frameworks = frameworkRepository.findAllByIsDeleted(TrueOrFalse.F);

        Map<String, List<FrameworkInfo>> frameworkMap = new HashMap<>();

        List<FrameworkInfo> frontendFrameworks = frameworks.stream()
                .filter(f -> FrameworkCategory.FRONTEND.equals(f.getCategory()))
                .map(f -> FrameworkInfo.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .build())
                .collect(Collectors.toList());

        List<FrameworkInfo> backendFrameworks = frameworks.stream()
                .filter(f -> FrameworkCategory.BACKEND.equals(f.getCategory()))
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