package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {

    // 테마ID로 모든 퀘스트 조회 (삭제되지 않은 것만, 순서대로)
    List<Quest> findByThemeIdAndIsDeletedOrderByQuestOrderAsc(Long themeId, TrueOrFalse isDeleted);

    @Query("SELECT q FROM Quest q WHERE q.themeId = :themeId " +
            "AND q.questOrder > :currentOrder " +
            "AND q.isDeleted = :isDeleted " +
            "ORDER BY q.questOrder ASC LIMIT 1")
    Optional<Quest> findNextQuest(@Param("themeId") Long themeId,
                                  @Param("currentOrder") Integer currentOrder,
                                  @Param("isDeleted") TrueOrFalse isDeleted);

    Optional<Quest> findByThemeIdAndQuestOrder(Long themeId, int i);
}
