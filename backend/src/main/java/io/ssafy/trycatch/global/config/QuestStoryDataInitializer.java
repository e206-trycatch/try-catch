package io.ssafy.trycatch.global.config;

import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.domain.room.entity.QuestStory;
import io.ssafy.trycatch.domain.room.repository.QuestRepository;
import io.ssafy.trycatch.domain.room.repository.QuestStoryRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuestStoryDataInitializer implements CommandLineRunner {

    private final QuestStoryRepository questStoryRepository;
    private final QuestRepository questRepository;  // ✅ 추가!

    @Override
    public void run(String... args) throws Exception {
        log.info("QuestStory 초기 데이터 삽입 시작...");

        // 이미 데이터가 있으면 스킵
        long count = questStoryRepository.count();
        if (count > 0) {
            log.info("QuestStory 데이터가 이미 존재합니다: {}개", count);
            return;
        }

        // ✅ Quest 객체들 미리 조회
        Quest quest1 = questRepository.findById(1L).orElseThrow();
        Quest quest2 = questRepository.findById(2L).orElseThrow();
        Quest quest3 = questRepository.findById(3L).orElseThrow();
        Quest quest4 = questRepository.findById(4L).orElseThrow();
        Quest quest5 = questRepository.findById(5L).orElseThrow();
        Quest quest6 = questRepository.findById(6L).orElseThrow();

        // 퀘스트 1번 - 3개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest1)  // ✅ 변경: questId → quest
                .storyOrder(1)
                .imageUrl("/images/quest/quest1-1.jpg")
                .content("당신은 새로운 프로젝트의 시작점에 서 있습니다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest1)
                .storyOrder(2)
                .imageUrl("/images/quest/quest1-2.jpg")
                .content("첫 번째 임무는 Spring Boot 프로젝트를 생성하는 것입니다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest1)
                .storyOrder(3)
                .imageUrl("/images/quest/quest1-3.jpg")
                .content("기본 설정을 완료하고 프로젝트를 시작해봅시다!")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 퀘스트 2번 - 2개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest2)
                .storyOrder(1)
                .imageUrl("/images/quest/quest2-1.jpg")
                .content("프로젝트 설정을 완료했습니다!")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest2)
                .storyOrder(2)
                .imageUrl("/images/quest/quest2-2.jpg")
                .content("이제 MySQL을 연동하고 Entity를 작성해봅시다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 퀘스트 3번 - 2개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest3)
                .storyOrder(1)
                .imageUrl("/images/quest/quest3-1.jpg")
                .content("데이터베이스 연동도 완료!")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest3)
                .storyOrder(2)
                .imageUrl("/images/quest/quest3-2.jpg")
                .content("REST API를 구현하여 클라이언트와 통신해봅시다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 퀘스트 4번 - 3개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest4)
                .storyOrder(1)
                .imageUrl("/images/quest/quest4-1.jpg")
                .content("새로운 프론트엔드 프로젝트가 시작됩니다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest4)
                .storyOrder(2)
                .imageUrl("/images/quest/quest4-2.jpg")
                .content("React 컴포넌트 구조를 설계해봅시다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest4)
                .storyOrder(3)
                .imageUrl("/images/quest/quest4-3.jpg")
                .content("어떤 컴포넌트가 필요할지 생각해보세요!")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 퀘스트 5번 - 2개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest5)
                .storyOrder(1)
                .imageUrl("/images/quest/quest5-1.jpg")
                .content("컴포넌트 구조가 완성되었습니다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest5)
                .storyOrder(2)
                .imageUrl("/images/quest/quest5-2.jpg")
                .content("Redux 또는 Context API로 상태 관리를 구현해봅시다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 퀘스트 6번 - 2개 스토리
        questStoryRepository.save(QuestStory.builder()
                .quest(quest6)
                .storyOrder(1)
                .imageUrl("/images/quest/quest6-1.jpg")
                .content("상태 관리도 완료!")
                .isDeleted(TrueOrFalse.F)
                .build());

        questStoryRepository.save(QuestStory.builder()
                .quest(quest6)
                .storyOrder(2)
                .imageUrl("/images/quest/quest6-2.jpg")
                .content("마지막으로 백엔드 API와 연동하여 데이터를 주고받아봅시다.")
                .isDeleted(TrueOrFalse.F)
                .build());

        long finalCount = questStoryRepository.count();
        log.info("QuestStory 초기 데이터 삽입 완료! 총 {}개", finalCount);
    }
}