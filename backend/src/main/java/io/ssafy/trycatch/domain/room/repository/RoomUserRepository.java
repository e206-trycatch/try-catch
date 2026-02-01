package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    Optional<RoomUser> findByRoomIdAndUserIdAndIsDeleted(Long roomId, Long userId, TrueOrFalse isDeleted);
}