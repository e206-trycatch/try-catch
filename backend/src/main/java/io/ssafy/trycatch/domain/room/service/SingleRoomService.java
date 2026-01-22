package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.request.SingleRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomCreateRespDto;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto.FrameworkInfo;
import io.ssafy.trycatch.domain.room.entity.Framework;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.domain.room.enums.RoomMode;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.FrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
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
    private final RoomRepository roomRepository;

    // 싱글 모드 방 설정
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

    // 싱글 방 생성
    @Transactional
    public SingleRoomCreateRespDto createSingleRoom(SingleRoomCreateReqDto request) {

        Theme theme = validateTheme(request.getThemeId());

        validateFrameworksByPosition(
                request.getPosition(),
                request.getFrontId(),
                request.getBackId()
        );

        Room room = Room.builder()
                .themeId(request.getThemeId())
                .frontendId(request.getFrontId())
                .backendId(request.getBackId())
                .mode(RoomMode.SINGLE)
                .status(RoomStatus.CREATED)
                .life(3)
                .remainingHintCount(3)
                .isDeleted(TrueOrFalse.F)
                .build();

        Room savedRoom = roomRepository.save(room);

        SingleRoomCreateRespDto response = SingleRoomCreateRespDto.builder()
                .roomId(savedRoom.getId()).build();

        return response;
    }

    // 테마 존재 여부 검증
    private Theme validateTheme(Long themeId) {
        return themeRepository.findById(themeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 테마입니다."));
    }

    // 포지션에 따른 프레임워크 유효성 검증
    private void validateFrameworksByPosition(String position, Long frontId, Long backId) {
        switch (position) {
            case "FRONTEND":
                // 프론트엔드는 frontId 필수
                if (frontId != null && backId == null) {
                    validateFramework(frontId);
                } else {
                    throw new IllegalArgumentException("프론트엔드 포지션은 프론트엔드 프레임워크만 선택해야 합니다.");
                }
                break;

            case "BACKEND":
                // 백엔드는 backId 필수
                if (frontId == null && backId != null) {
                    validateFramework(backId);
                } else {
                    throw new IllegalArgumentException("백엔드 포지션은 백엔드 프레임워크만 선택해야 합니다.");
                }
                break;

            case "FULLSTACK":
                // 풀스택은 둘 다 필수
                if (frontId == null || backId == null) {
                    throw new IllegalArgumentException("풀스택 포지션은 프론트엔드와 백엔드 프레임워크를 모두 선택해야 합니다.");
                }
                validateFramework(frontId);
                validateFramework(backId);
                break;

            default:
                throw new IllegalArgumentException("올바르지 않은 포지션입니다: " + position);
        }
    }

    // 프레임워크 존재 여부 검증
    private Framework validateFramework(Long frameworkId) {
        return frameworkRepository.findById(frameworkId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 프레임워크입니다. frameworkId: " + frameworkId));
    }

    // 방 제목 생성 (예: "프로젝트 에이아 - 싱글 플레이")
    private String generateRoomName(String themeName) {
        return themeName + " - 싱글 플레이";
    }
}