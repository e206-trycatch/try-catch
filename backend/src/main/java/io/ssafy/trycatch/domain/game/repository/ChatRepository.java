package io.ssafy.trycatch.domain.game.repository;

import io.ssafy.trycatch.domain.game.entity.Chat;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends CrudRepository<Chat, String> {

    // 특정 게임방의 모든 메시지 조회 (시간순 정렬)
    List<Chat> findByRoomIdOrderBySentAtAsc(Long roomId);

    // 특정 게임방의 메시지 수
    long countByRoomId(Long roomId);
}




