package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.request.SingleRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.response.*;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto.FrameworkInfo;
import io.ssafy.trycatch.domain.room.entity.*;
import io.ssafy.trycatch.domain.room.enums.*;
import io.ssafy.trycatch.domain.room.repository.*;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.websocket.common.TimeLimitPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.ssafy.trycatch.global.exception.ErrorCode.ROOM_USER_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SingleRoomService {

    private final ThemeRepository themeRepository;
    private final FrameworkRepository frameworkRepository;
    private final RoomRepository roomRepository;
    private final QuestRepository questRepository;
    private final QuestStoryRepository questStoryRepository;
    private final ProblemFrameworkRepository problemFrameworkRepository;
    private final ProblemFileRepository problemFileRepository;
    private final RoomUserRepository roomUserRepository;

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
    public SingleRoomCreateRespDto createSingleRoom(Long userId, SingleRoomCreateReqDto request) {

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

        RoomPosition roomPosition = RoomPosition.valueOf(request.getPosition());
        createSingleRoomUser(userId, savedRoom.getId(), roomPosition);

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

    private String generateRoomName(String themeName)    {
        return themeName + " - 싱글 플레이";
    }

    // 각 퀘스트 시작 페이지 생성
    public List<QuestDetailRespDto> getQuestList(Long themeId) {
        // 1. 테마 존재 여부 확인
        validateTheme(themeId);

        // 2. 해당 테마의 모든 퀘스트 조회 (순서대로)
        List<Quest> quests = questRepository.findByThemeIdAndIsDeletedOrderByQuestOrderAsc(
                themeId, TrueOrFalse.F);

        // 3. 퀘스트가 없으면 예외
        if (quests.isEmpty()) {
            throw new IllegalArgumentException(
                    "해당 테마에 퀘스트가 없습니다. themeId: " + themeId);
        }

        log.info("퀘스트 목록 조회 완료 - themeId: {}, count: {}", themeId, quests.size());

        // 4. DTO 변환
        return quests.stream()
                .map(quest -> QuestDetailRespDto.builder()
                        .questId(quest.getId())
                        .questOrder(quest.getQuestOrder())
                        .title(quest.getTitle())
                        .description(quest.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    // 퀘스트 스토리 목록 조회
    public List<QuestStoryRespDto> getQuestStoryList(Long questId) {
        // 1. 해당 퀘스트의 모든 스토리 조회 (순서대로)
        List<QuestStory> stories = questStoryRepository.findByQuestIdAndIsDeletedOrderByStoryOrderAsc(
                questId, TrueOrFalse.F);

        // 2. 스토리가 없으면 예외
        if (stories.isEmpty()) {
            throw new IllegalArgumentException(
                    "해당 퀘스트 스토리를 찾을 수 없습니다.");
        }

        log.info("퀘스트 스토리 목록 조회 완료");

        // 3. DTO 변환
        return stories.stream()
                .map(story -> QuestStoryRespDto.builder()
                        .storyId(story.getId())
                        .storyOrder(story.getStoryOrder())
                        .imageUrl(story.getImageUrl())
                        .content(story.getContent())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ProblemFilesRespDto getProblemFiles(Long roomId, Long questId) {
        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 방을 찾을 수 없습니다. roomId: " + roomId));

        // 목숨 초기화 (다음 퀘스트용)
        room.resetLife();

        // 힌트 개수 초기화
        room.resetHint();
        
        roomRepository.save(room);
        // 2. Room에서 frontendId, backendId 추출
        Long frontendId = room.getFrontendId();
        Long backendId = room.getBackendId();

        // 3. frontendId/backendId 유무로 position 판단 (✅ 수정!)
        String position = determinePosition(frontendId, backendId);


        // 4. position에 따라 ProblemFramework 조회
        ProblemFramework problemFramework = findProblemFrameworkByPosition(
                questId, position, frontendId, backendId);

        // 5. ProblemFile 목록 조회
        List<ProblemFile> allFiles = problemFileRepository
                .findByProblemFrameworkIdAndIsDeletedOrderByFilePath(
                        problemFramework.getId(), TrueOrFalse.F);

        // 6. Room의 position에 따라 파일 필터링
        List<ProblemFile> filteredFiles = filterFilesByPosition(allFiles, position);

        log.info("문제 파일 목록 조회 완료 - problemFrameworkId: {}, totalFiles: {}, filteredFiles: {}",
                problemFramework.getId(), allFiles.size(), filteredFiles.size());

        // 7. DTO 변환
        List<ProblemFileRespDto> fileDtos = filteredFiles.stream()
                .map(file -> ProblemFileRespDto.builder()
                        .fileId(file.getId())
                        .filePath(file.getFilePath())
                        .codeRole(file.getCodeRole())
                        .code(file.getCode())
                        .fileType(file.getFileType())
                        .build())
                .collect(Collectors.toList());

        // 8. 응답 생성
        return ProblemFilesRespDto.builder()
                .problemFrameworkId(problemFramework.getId())
                .frontendErrorLog(problemFramework.getFrontendErrorLog())
                .backendErrorLog(problemFramework.getBackendErrorLog())
                .files(fileDtos)
                .build();
    }

    // frontendId/backendId 유무로 position 판단
    private String determinePosition(Long frontendId, Long backendId) {
        if (frontendId != null && backendId != null) {
            return "FULLSTACK";
        } else if (frontendId != null && backendId == null) {
            return "FRONTEND";
        } else if (frontendId == null && backendId != null) {
            return "BACKEND";
        } else {
            throw new IllegalArgumentException("frontendId와 backendId가 모두 null입니다.");
        }
    }

    // position에 따라 ProblemFramework 조회
    private ProblemFramework findProblemFrameworkByPosition(
            Long questId, String position, Long frontendId, Long backendId) {

        switch (position) {
            case "FRONTEND":
                // 프론트엔드: frontendId만 있고 backendId는 null
                return problemFrameworkRepository
                        .findByQuestIdAndFrontendIdAndBackendIdAndIsDeleted(
                                questId, frontendId, null, TrueOrFalse.F)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "해당 퀘스트의 문제 정보를 찾을 수 없습니다. questId: " + questId));

            case "BACKEND":
                // 백엔드: backendId만 있고 frontendId는 null
                return problemFrameworkRepository
                        .findByQuestIdAndFrontendIdAndBackendIdAndIsDeleted(
                                questId, null, backendId, TrueOrFalse.F)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "해당 퀘스트의 문제 정보를 찾을 수 없습니다. questId: " + questId));

            case "FULLSTACK":
                // 풀스택: 둘 다 있어야 함
                return problemFrameworkRepository
                        .findByQuestIdAndFrontendIdAndBackendIdAndIsDeleted(
                                questId, frontendId, backendId, TrueOrFalse.F)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "해당 퀘스트의 문제 정보를 찾을 수 없습니다. questId: " + questId));

            default:
                throw new IllegalArgumentException("올바르지 않은 포지션입니다: " + position);
        }
    }

    // position에 따라 파일 필터링
    private List<ProblemFile> filterFilesByPosition(List<ProblemFile> files, String position) {
        if ("FRONTEND".equals(position)) {
            // FRONTEND만
            return files.stream()
                    .filter(file -> FrameworkCategory.FRONTEND.equals(file.getCodeRole()))
                    .collect(Collectors.toList());
        } else if ("BACKEND".equals(position)) {
            // BACKEND만
            return files.stream()
                    .filter(file -> FrameworkCategory.BACKEND.equals(file.getCodeRole()))
                    .collect(Collectors.toList());
        } else {
            // FULLSTACK - 모든 파일
            return files;
        }
    }
    private void createSingleRoomUser(Long userId, Long roomId, RoomPosition position) {
        RoomUser roomUser = RoomUser.builder()
                .userId(userId)
                .roomId(roomId)
                .position(position)
                .role(RoomRole.HOST) // 싱글은 본인이 방장
                .isReady(TrueOrFalse.T) // 싱글은 생성 즉시 준비 완료 상태
                .isDeleted(TrueOrFalse.F)
                .build();

        roomUserRepository.save(roomUser);
        log.info("싱글 방 유저 생성 완료 - userId: {}, roomId: {}", userId, roomId);
    }

    // 힌트 사용 (개수 차감)
    @Transactional
    public int useHint(Long roomId) {
        Room room = findRoomById(roomId);
        room.useHint(); // 엔티티의 비즈니스 로직 호출
        log.info("힌트 사용 - roomId: {}, 남은 힌트: {}", roomId, room.getRemainingHintCount());
        return room.getRemainingHintCount();
    }

    // 생명 감소 (틀렸을 때 호출)
    @Transactional
    public Map<String, Object> decreaseLife(Long roomId) {
        Room room = findRoomById(roomId);
        room.decreaseLife();

        Map<String, Object> result = new HashMap<>();
        result.put("remainingLife", room.getLife());
        result.put("isGameOver", room.isGameOver());

        if (room.isGameOver()) {
            room.endGame();
            log.info("게임 오버 - roomId: {}", roomId);
        }

        return result;
    }

    // 게임 수동 종료
    @Transactional
    public void endGame(Long roomId) {
        Room room = findRoomById(roomId);
        room.endGame();
        log.info("게임 종료 - roomId: {}", roomId);
    }

    private Room findRoomById(Long roomId) {
        return roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 방을 찾을 수 없습니다. roomId: " + roomId));
    }

}