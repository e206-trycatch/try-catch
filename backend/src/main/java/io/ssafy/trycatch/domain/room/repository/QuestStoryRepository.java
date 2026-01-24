package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.domain.room.entity.QuestStory;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestStoryRepository extends JpaRepository<QuestStory, Long> {

    List<QuestStory> findByQuestIdAndIsDeletedOrderByStoryOrderAsc(
            Long questId, TrueOrFalse isDeleted);
}