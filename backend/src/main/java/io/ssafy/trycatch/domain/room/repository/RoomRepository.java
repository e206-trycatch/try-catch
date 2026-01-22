package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

}
