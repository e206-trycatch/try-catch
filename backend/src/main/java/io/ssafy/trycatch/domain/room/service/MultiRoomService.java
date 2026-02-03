package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.request.MultiRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.request.MultiRoomJoinReqDto;
import io.ssafy.trycatch.domain.room.dto.response.*;
import io.ssafy.trycatch.domain.room.dto.response.MultiRoomSettingRespDto.FrameworkInfo;
import io.ssafy.trycatch.domain.room.entity.*;
import io.ssafy.trycatch.domain.room.enums.*;
import io.ssafy.trycatch.domain.room.repository.*;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MultiRoomService {

    private final ThemeRepository themeRepository;
    private final FrameworkRepository frameworkRepository;
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;
    private final QuestRepository questRepository;
    private final QuestStoryRepository questStoryRepository;

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



    @Transactional
    public MultiRoomCreateRespDto createMultiRoom(Long userId, MultiRoomCreateReqDto request) {
        
        // Host 프레임워크 검증
        Framework hostFramework = validateFramework(request.getHost().getFrameworkId());

        // Guest 프레임워크 검증
        Framework guestFramework = validateFramework(request.getGuest().getFrameworkId());

        // Host와 Guest 프레임워크가 다른 카테고리인지 검증
        validateFrameworkCombination(hostFramework, guestFramework);

        // frontendId와 backendId 결정
        Long frontendId = null;
        Long backendId = null;

        if (hostFramework.getCategory() == FrameworkCategory.FRONTEND) {
            frontendId = hostFramework.getId();
            backendId = guestFramework.getId();
        } else {
            frontendId = guestFramework.getId();
            backendId = hostFramework.getId();
        }

        // 초대 코드 생성
        String invitationCode = generateInvitationCode();

        // Room 생성
        Room room = Room.builder()
                .themeId(request.getThemeId())
                .frontendId(frontendId)
                .backendId(backendId)
                .roomName(request.getRoomName())
                .mode(RoomMode.MULTI)
                .status(RoomStatus.CREATED)
                .invitedCode(invitationCode)
                .life(3)
                .remainingHintCount(3)
                .isDeleted(TrueOrFalse.F)
                .build();

        Room savedRoom = roomRepository.save(room);

        // RoomUser 생성 (Host만 먼저 생성)
        RoomPosition hostPosition = determinePosition(hostFramework);
        createMultiRoomUser(userId, savedRoom.getId(), hostPosition, RoomRole.HOST);

        log.info("멀티 방 생성 완료 - roomId: {}, invitationCode: {}, host: {}",
                savedRoom.getId(), invitationCode, hostFramework.getName());

        // Response 생성
        return MultiRoomCreateRespDto.builder()
                .roomId(savedRoom.getId())
                .invitationCode(invitationCode)
                .roomName(savedRoom.getRoomName())
                .themeId(savedRoom.getThemeId().longValue())
                .host(MultiRoomCreateRespDto.HostInfo.builder()
                        .frameworkId(hostFramework.getId())
                        .frameworkName(hostFramework.getName())
                        .role(determinePosition(hostFramework))
                        .build())
                .guest(MultiRoomCreateRespDto.GuestInfo.builder()
                        .frameworkId(guestFramework.getId())
                        .frameworkName(guestFramework.getName())
                        .role(determinePosition(guestFramework))
                        .build())
                .build();
    }

    // 테마 검증
    private Theme validateTheme(Long themeId) {
        return themeRepository.findById(themeId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 테마입니다. themeId: " + themeId));
    }

    // 프레임워크 검증
    private Framework validateFramework(Long frameworkId) {
        return frameworkRepository.findById(frameworkId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 프레임워크입니다. frameworkId: " + frameworkId));
    }

    // Host와 Guest 프레임워크 조합 검증 (같은 카테고리 불가)
    private void validateFrameworkCombination(Framework hostFramework, Framework guestFramework) {
        if (hostFramework.getCategory() == guestFramework.getCategory()) {
            throw new IllegalArgumentException(
                    "Host와 Guest는 서로 다른 카테고리(FRONTEND/BACKEND)의 프레임워크를 선택해야 합니다.");
        }
    }

    // 초대 코드 생성 (8자리 랜덤 영숫자)
    private String generateInvitationCode() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }

    // 프레임워크로부터 포지션 결정
    private RoomPosition determinePosition(Framework framework) {
        return framework.getCategory() == FrameworkCategory.FRONTEND
                ? RoomPosition.FRONTEND
                : RoomPosition.BACKEND;
    }

    // RoomUser 생성
    private void createMultiRoomUser(Long userId, Long roomId, RoomPosition position, RoomRole role) {
        RoomUser roomUser = RoomUser.builder()
                .userId(userId)
                .roomId(roomId)
                .position(position)
                .role(role)
                .isReady(TrueOrFalse.F)
                .isDeleted(TrueOrFalse.F)
                .build();

        roomUserRepository.save(roomUser);
        log.info("RoomUser 생성 완료 - userId: {}, roomId: {}, position: {}, role: {}",
                userId, roomId, position, role);
    }
    @Transactional
    public void leaveMultiRoom(Long userId, Long roomId) {
        // 1. RoomUser 조회
        RoomUser roomUser = roomUserRepository
                .findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "방 참가자가 아닙니다. userId: " + userId + ", roomId: " + roomId));

        // 2. Host인지 Guest인지 판단
        if (roomUser.isHost()) {
            // Host가 나가면 → 방 전체 삭제
            deleteEntireRoom(roomId);
            log.info("Host가 방을 나가 방 전체 삭제 - roomId: {}, userId: {}", roomId, userId);
        } else {
            // Guest가 나가면 → Guest만 삭제
            roomUser.delete();
            roomUserRepository.save(roomUser);
            log.info("Guest가 방에서 나감 - roomId: {}, userId: {}", roomId, userId);
        }
    }

    // 방 전체 삭제
    private void deleteEntireRoom(Long roomId) {
        // 1. Room 삭제
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 방입니다. roomId: " + roomId));

        room.delete();
        roomRepository.save(room);

        // 2. 모든 RoomUser 삭제
        List<RoomUser> roomUsers = roomUserRepository
                .findAllByRoomIdAndIsDeleted(roomId, TrueOrFalse.F);

        for (RoomUser roomUser : roomUsers) {
            roomUser.delete();
            roomUserRepository.save(roomUser);
        }

    }

    // 초대코드로 방 입장
    @Transactional
    public MultiRoomJoinRespDto joinMultiRoom(Long userId, MultiRoomJoinReqDto request) {
        // 1. 초대코드로 Room 조회
        Room room = roomRepository.findByInvitedCodeAndIsDeleted(request.getInvitationCode(), TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "유효하지 않은 초대코드입니다. code: " + request.getInvitationCode()));

        // 2. 이미 방에 참가 중인지 확인
        boolean alreadyJoined = roomUserRepository
                .existsByUserIdAndRoomIdAndIsDeleted(userId, room.getId(), TrueOrFalse.F);

        if (alreadyJoined) {
            throw new IllegalArgumentException("이미 방에 참가 중입니다. roomId: " + room.getId());
        }

        // 3. 방이 가득 찼는지 확인 (Host + Guest = 2명)
        long participantCount = roomUserRepository
                .countByRoomIdAndIsDeleted(room.getId(), TrueOrFalse.F);

        if (participantCount >= 2) {
            throw new IllegalArgumentException("방이 가득 찼습니다. roomId: " + room.getId());
        }

        // 4. Host 조회
        RoomUser host = roomUserRepository
                .findByRoomIdAndRoleAndIsDeleted(room.getId(), RoomRole.HOST, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "방장을 찾을 수 없습니다. roomId: " + room.getId()));

        // 5. Guest 프레임워크 자동 결정 (Host와 반대)
        Long guestFrameworkId;
        RoomPosition guestPosition;

        if (host.getPosition() == RoomPosition.FRONTEND) {
            // Host가 FRONTEND면 Guest는 BACKEND
            guestFrameworkId = room.getBackendId();
            guestPosition = RoomPosition.BACKEND;
        } else {
            // Host가 BACKEND면 Guest는 FRONTEND
            guestFrameworkId = room.getFrontendId();
            guestPosition = RoomPosition.FRONTEND;
        }

        // 6. Guest Framework 조회 및 검증
        Framework guestFramework = validateFramework(guestFrameworkId);

        // 7. RoomUser 생성 (Guest)
        RoomUser guest = RoomUser.builder()
                .userId(userId)
                .roomId(room.getId())
                .isReady(TrueOrFalse.F)
                .position(guestPosition)
                .role(RoomRole.GUEST)
                .joinedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(TrueOrFalse.F)
                .build();

        roomUserRepository.save(guest);

        log.info("방 입장 완료 - roomId: {}, userId: {}, position: {}, frameworkId: {}",
                room.getId(), userId, guestPosition, guestFramework.getId());

        // 8. Response 생성
        return MultiRoomJoinRespDto.builder()
                .roomId(room.getId())
                .roomName(room.getRoomName())
                .guest(MultiRoomJoinRespDto.GuestInfo.builder()
                        .userId(userId)
                        .position(guestPosition)
                        .frameworkId(guestFramework.getId())
                        .frameworkName(guestFramework.getName())
                        .build())
                .build();
    }

    public MultiRoomInfoRespDto getMultiRoomInfo(Long roomId) {
        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 방입니다. roomId: " + roomId));

        // 2. Theme 조회
        Theme theme = validateTheme(room.getThemeId());

        // 3. RoomUser 목록 조회 (Host, Guest)
        List<RoomUser> roomUsers = roomUserRepository
                .findAllByRoomIdAndIsDeleted(roomId, TrueOrFalse.F);

        // 4. Host와 Guest 분리
        RoomUser hostRoomUser = roomUsers.stream()
                .filter(ru -> ru.getRole() == RoomRole.HOST)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "방장을 찾을 수 없습니다. roomId: " + roomId));

        RoomUser guestRoomUser = roomUsers.stream()
                .filter(ru -> ru.getRole() == RoomRole.GUEST)
                .findFirst()
                .orElse(null); // Guest는 없을 수 있음

        // 5. Host 정보 구성
        MultiRoomInfoRespDto.ParticipantInfo hostInfo = buildParticipantInfo(
                hostRoomUser, room.getFrontendId(), room.getBackendId());

        // 6. Guest 정보 구성
        MultiRoomInfoRespDto.ParticipantInfo guestInfo = null;
        if (guestRoomUser != null) {
            guestInfo = buildParticipantInfo(
                    guestRoomUser, room.getFrontendId(), room.getBackendId());
        }

        // 7. Response 생성
        return MultiRoomInfoRespDto.builder()
                .roomId(room.getId())
                .roomName(room.getRoomName())
                .invitationCode(room.getInvitedCode())
                .themeId(room.getThemeId().intValue())
                .themeName(theme.getName())
                .roomStatus(room.getStatus())
                .host(hostInfo)
                .guest(guestInfo)
                .build();
    }

    // ParticipantInfo 생성 헬퍼 메서드
    private MultiRoomInfoRespDto.ParticipantInfo buildParticipantInfo(
            RoomUser roomUser, Long frontendId, Long backendId) {

        // User 조회
        User user = userRepository.findById(roomUser.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 사용자입니다. userId: " + roomUser.getUserId()));

        // Framework 결정
        Long frameworkId = roomUser.getPosition().name().equals("FRONTEND")
                ? frontendId
                : backendId;

        Framework framework = frameworkRepository.findById(frameworkId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 프레임워크입니다. frameworkId: " + frameworkId));

        return MultiRoomInfoRespDto.ParticipantInfo.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .position(roomUser.getPosition())
                .frameworkId(framework.getId())
                .frameworkName(framework.getName())
                .isReady(roomUser.getIsReady() == TrueOrFalse.T)
                .build();
    }

    public List<QuestStoryRespDto> getQuestStory(Long roomId, Long questId) {
        // 1. Room 검증
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 방입니다. roomId: " + roomId));

        // 2. Quest 검증 (해당 테마의 퀘스트인지)
        Quest quest = questRepository.findById(questId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 퀘스트입니다. questId: " + questId));

        if (!quest.getThemeId().equals(room.getThemeId())) {
            throw new IllegalArgumentException(
                    "해당 테마의 퀘스트가 아닙니다. questId: " + questId + ", themeId: " + room.getThemeId());
        }

        // 3. QuestStory 목록 조회 (storyOrder 순)
        List<QuestStory> questStories = questStoryRepository
                .findByQuestIdAndIsDeletedOrderByStoryOrderAsc(questId, TrueOrFalse.F);

        if (questStories.isEmpty()) {
            throw new IllegalArgumentException(
                    "퀘스트 스토리를 찾을 수 없습니다. questId: " + questId);
        }

        // 4. Response 생성
        return questStories.stream()
                .map(qs -> QuestStoryRespDto.builder()
                        .storyId(qs.getId())
                        .storyOrder(qs.getStoryOrder())
                        .imageUrl(qs.getImageUrl())
                        .content(qs.getContent())
                        .build())
                .collect(Collectors.toList());
    }
}