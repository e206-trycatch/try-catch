package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // RoomRepository.java
    Optional<Room> findByIdAndIsDeleted(Long id, TrueOrFalse isDeleted);
}
