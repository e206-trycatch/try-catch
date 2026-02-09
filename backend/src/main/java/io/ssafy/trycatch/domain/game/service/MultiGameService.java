package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.game.dto.request.CodeSaveReqDto;
import io.ssafy.trycatch.domain.game.dto.response.MultiProblemFileListRespDto;
import io.ssafy.trycatch.domain.game.dto.response.PartnerCodeRespDto;
import io.ssafy.trycatch.domain.game.entity.SavedCode;
import io.ssafy.trycatch.domain.game.mapper.CodeSaveMapper;
import io.ssafy.trycatch.domain.game.repository.SavedCodeRepository;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import io.ssafy.trycatch.domain.room.entity.*;
import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.FrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.room.repository.RoomUserRepository;
import io.ssafy.trycatch.domain.room.service.SingleRoomService;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import io.ssafy.trycatch.websocket.dto.game.CodeSavedNotifyDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.ssafy.trycatch.global.exception.ErrorCode.*;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MultiGameService {

    private final SingleRoomService singleRoomService;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ProblemFileRepository problemFileRepository;
    private final RoomUserRepository roomUserRepository;
    private final CodeSaveMapper codeSaveMapper;
    private final SavedCodeRepository savedCodeRepository;
    private final FrameworkRepository frameworkRepository;


    private final SimpMessageSendingOperations messagingTemplate;

    // 멀티 문제 파일 조회
    public MultiProblemFileListRespDto getMultiProblemFiles(
            Long roomId, Long questId, Long userId) {

        // TODO : userId로 room_user에서 position 조회

        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 목숨 초기화 (다음 퀘스트용)
        room.resetLife(); // 타이머 생기면 삭제

        // 힌트 개수 초기화
        room.resetHint(); // 타이머 생기면 삭제
        room.startQuestGame(); // 타이머 생기면 삭제

        roomRepository.save(room);

        // 2. Room에서 frontendId, backendId 추출
        Long frontendId = room.getFrontendId();
        Long backendId = room.getBackendId();

        // 3. frontendId/backendId 유무로 position 판단
        String position = singleRoomService.determinePosition(frontendId, backendId);


        // 4. position에 따라 ProblemFramework 조회
        ProblemFramework problemFramework = singleRoomService.findProblemFrameworkByPosition(
                questId, position, frontendId, backendId);

        // 5. ProblemFile 목록 조회
        List<ProblemFile> allFiles = problemFileRepository
                .findByProblemFrameworkIdAndIsDeletedOrderByFilePath(
                        problemFramework.getId(), TrueOrFalse.F);

        // 6. Room의 position에 따라 파일 필터링
        List<ProblemFile> filteredFiles = singleRoomService.filterFilesByPosition(allFiles, position);

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

        // 8. userId로 유저의 포지션 찾기
        RoomUser roomUser = roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(USER_NOT_IN_ROOM));

        // 9. 유저 포지션에 맞는 프레임워크 ID 가져오기
        Long userFrameworkId = roomUser.getPosition() == RoomPosition.FRONTEND
                ? room.getFrontendId()
                : room.getBackendId();

        // 10. Framework 엔티티 조회
        Framework framework = frameworkRepository.findById(userFrameworkId)
                .orElseThrow(() -> new CustomException(FRAMEWORK_NOT_FOUND));

        return MultiProblemFileListRespDto.builder()
                .problemFrameworkId(problemFramework.getId())
                .myPosition(roomUser.getPosition().name())
                .framework(convertFrameworkName(framework.getName()))
                .frontendErrorLog(problemFramework.getFrontendErrorLog())
                .backendErrorLog(problemFramework.getBackendErrorLog())
                .files(fileDtos)
                .build();

    }

    private String convertFrameworkName(String frameworkName) {
        switch (frameworkName) {
            case "React":
                return "react";
            case "Vue.js":
                return "vue";
            case "Spring Boot":
                return "spring";
            case "Django":
                return "django";
            default:
                return frameworkName.toLowerCase();
        }
    }

    // 멀티 - 문제 임시 저장
    @Transactional
    public void saveCode(Long roomId, Long userId, CodeSaveReqDto request) {
        // (예외) 방 존재 여부
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // (예외) 방 상태가 PLAYING인지
        if (room.getStatus() != RoomStatus.PLAYING) {
            throw new CustomException(ROOM_NOT_PLAYING);
        }

        // room_user에서 유저의 position 조회
        RoomUser roomUser = roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(USER_NOT_IN_ROOM));

        // 저장한 유저의 포지션에 맞춰 코드 role 지정
        String codeRole = roomUser.getPosition().name();  // FRONTEND or BACKEND

        // 2. 파일별로 upsert
        for (CodeSaveReqDto.FileItem file : request.getFiles()) {
            codeSaveMapper.upsertSavedCode(
                    roomId,
                    request.getProblemFrameworkId(),
                    userId,
                    codeRole,
                    file.getFileType(),
                    file.getFilePath(),
                    file.getCode()
            );
        }
        sendCodeSaveNotification(roomId, roomUser);
    }

    private void sendCodeSaveNotification(Long roomId, RoomUser roomUser) {

        User user = userRepository.findById(roomUser.getUserId())
                .orElseThrow(() -> new CustomException(USER_NOT_FOUND));

        CodeSavedNotifyDto notifyDto = new CodeSavedNotifyDto(
                user.getId(),
                user.getNickname(),
                roomUser.getPosition().name(),
                LocalDateTime.now()
        );

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                SocketRespDto.of(SocketEventType.CODE_SAVED, notifyDto)
        );
    }

    // 상대방 코드 불러오기
    public PartnerCodeRespDto getPartnerCode(Long roomId, Long problemFrameworkId, Long userId) {
        // 1. 방 존재 여부
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 2. 방 상태가 PLAYING인지
        if (room.getStatus() != RoomStatus.PLAYING) {
            throw new CustomException(ROOM_NOT_PLAYING);
        }

        // 3. 내 position 조회
        RoomUser roomUser = roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_USER_NOT_FOUND));

        // 4. 상대방 position 결정
        RoomPosition myPosition = roomUser.getPosition();
        RoomPosition partnerPosition = (myPosition == RoomPosition.FRONTEND) ? RoomPosition.BACKEND : RoomPosition.FRONTEND;

        // 5. 상대방 코드 조회
        List<SavedCode> partnerCodes = savedCodeRepository.findByRoomIdAndProblemFrameworkIdAndCodeRoleAndIsDeleted(
                roomId, problemFrameworkId, partnerPosition, TrueOrFalse.F
        );

        // 6. 응답 생성
        List<PartnerCodeRespDto.FileItem> files = partnerCodes.stream()
                .map(sc -> PartnerCodeRespDto.FileItem.builder()
                        .codeRole(sc.getCodeRole().name())
                        .filePath(sc.getFilePath())
                        .fileType(sc.getFileType().name())
                        .code(sc.getCode())
                        .build())
                .toList();

        return PartnerCodeRespDto.builder()
                .partnerPosition(partnerPosition.name())
                .files(files)
                .build();
    }

}
