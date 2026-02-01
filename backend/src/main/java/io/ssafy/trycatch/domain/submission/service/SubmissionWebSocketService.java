package io.ssafy.trycatch.domain.submission.service;

import io.ssafy.trycatch.domain.room.entity.*;
import io.ssafy.trycatch.domain.room.enums.RoomRole;
import io.ssafy.trycatch.domain.room.repository.*;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionWebSocketService {

    private final RoomUserRepository roomUserRepository;

    public void validateHost(Long roomId, Long userId) {
        RoomUser roomUser = roomUserRepository
                .findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.ROOM_USER_NOT_FOUND));

        if (roomUser.getRole() != RoomRole.HOST) {
            throw new CustomException(ErrorCode.NOT_HOST);
        }
    }
}
