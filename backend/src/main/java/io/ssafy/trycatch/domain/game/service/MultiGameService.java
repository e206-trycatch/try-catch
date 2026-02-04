package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.game.dto.response.MultiProblemFileListRespDto;
import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
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

import static io.ssafy.trycatch.global.exception.ErrorCode.USER_NOT_IN_ROOM;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MultiGameService {

    private final SingleRoomService singleRoomService;
    private final RoomRepository roomRepository;
    private final ProblemFileRepository problemFileRepository;
    private final RoomUserRepository roomUserRepository;

    // 멀티 문제 파일 조회
    public MultiProblemFileListRespDto getMultiProblemFiles(
            Long roomId, Long questId, Long userId) {

        // TODO : userId로 room_user에서 position 조회

        // 1. Room 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 방을 찾을 수 없습니다. roomId: " + roomId));

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
}
