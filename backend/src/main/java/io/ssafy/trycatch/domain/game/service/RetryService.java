package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomRole;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.room.repository.RoomUserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetryService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final SimpMessagingTemplate messagingTemplate;


    @Transactional
    public void retryGame(Long roomId, Long userId) {
        // 1. 방장 검증
        RoomUser roomUser = roomUserRepository
                .findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_USER_NOT_FOUND));

        if (roomUser.getRole() != RoomRole.HOST) {
            throw new CustomException(ErrorCode.NOT_HOST);
        }

        // 2. 방 조회
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_NOT_FOUND));

        // 5. 모든 유저를 Ready 해제
        List<RoomUser> roomUsers = roomUserRepository.findAllByRoomIdAndIsDeleted(roomId, TrueOrFalse.F);
        for (RoomUser ru : roomUsers) {
            ru.setReady(false);
        }

        log.info("게임 재도전 준비 완료 - roomId: {}, life: {}, hint: {}",
                roomId, room.getLife(), room.getRemainingHintCount());
    }
}
