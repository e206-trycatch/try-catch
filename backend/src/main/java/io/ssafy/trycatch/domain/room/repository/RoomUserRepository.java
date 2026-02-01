package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {

    // 특정 유저가 특정 방에 참가 중인지 확인
    Optional<RoomUser> findByUserIdAndRoomIdAndIsDeleted(Long userId, Long roomId, TrueOrFalse isDeleted);

    // 특정 유저가 특정 방에 참가 중인지 확인 (boolean)
    boolean existsByUserIdAndRoomIdAndIsDeleted(Long userId, Long roomId, TrueOrFalse isDeleted);

    Optional<RoomUser> findByRoomIdAndUserIdAndIsDeleted(Long roomId, Long userId, TrueOrFalse isDeleted);

    Optional<Object> findByRoomIdAndUserId(Long roomId, Long userId);
}