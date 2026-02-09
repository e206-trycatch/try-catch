package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.LockModeType;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // RoomRepository.java
    Optional<Room> findByIdAndIsDeleted(Long id, TrueOrFalse isDeleted);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :roomId")
    Optional<Room> findByIdForUpdate(@Param("roomId") Long roomId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :roomId AND r.isDeleted = :isDeleted")
    Optional<Room> findByIdWithLock(@Param("roomId") Long roomId,
                                    @Param("isDeleted") TrueOrFalse isDeleted);

    Optional<Room> findByInvitedCodeAndIsDeleted(String invitedCode, TrueOrFalse isDeleted);
}
