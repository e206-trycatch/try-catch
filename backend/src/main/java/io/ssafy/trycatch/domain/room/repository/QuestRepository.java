package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {

    // 테마ID로 모든 퀘스트 조회 (삭제되지 않은 것만, 순서대로)
    List<Quest> findByThemeIdAndIsDeletedOrderByQuestOrderAsc(Long themeId, TrueOrFalse isDeleted);
}
