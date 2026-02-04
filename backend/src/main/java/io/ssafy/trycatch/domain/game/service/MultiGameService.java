package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.game.dto.request.CodeSaveReqDto;
import io.ssafy.trycatch.domain.game.dto.response.MultiProblemFileListRespDto;
import io.ssafy.trycatch.domain.game.mapper.CodeSaveMapper;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.room.repository.RoomUserRepository;
import io.ssafy.trycatch.domain.room.service.SingleRoomService;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
    private final ProblemFileRepository problemFileRepository;
    private final RoomUserRepository roomUserRepository;
    private final CodeSaveMapper codeSaveMapper;

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

        // 3. frontendId/backendId 유무로 position 판단 (✅ 수정!)
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

        return MultiProblemFileListRespDto.builder()
                .problemFrameworkId(problemFramework.getId())
                .myPosition(roomUser.getPosition().name())
                .frontendErrorLog(problemFramework.getFrontendErrorLog())
                .backendErrorLog(problemFramework.getBackendErrorLog())
                .files(fileDtos)
                .build();

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
    }
}
