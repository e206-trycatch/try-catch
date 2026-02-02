package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomRole;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    Optional<RoomUser> findByRoomIdAndUserIdAndIsDeleted(Long roomId, Long userId, TrueOrFalse isDeleted);
    
    List<RoomUser> findAllByRoomIdAndIsDeleted(Long roomId, TrueOrFalse isDeleted);


    Optional<RoomUser> findByRoomIdAndIsDeleted(Long roomId, TrueOrFalse trueOrFalse);

    boolean existsByUserIdAndRoomIdAndIsDeleted(Long userId, Long roomId, TrueOrFalse isDeleted);

    long countByRoomIdAndIsDeleted(Long roomId, TrueOrFalse isDeleted);
    Optional<RoomUser> findByRoomIdAndRoleAndIsDeleted(Long roomId, RoomRole role, TrueOrFalse isDeleted);
}