package io.ssafy.trycatch.global.config;

import io.ssafy.trycatch.domain.room.entity.Quest;
import io.ssafy.trycatch.domain.room.repository.QuestRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuestDataInitializer implements CommandLineRunner {

    private final QuestRepository questRepository;

    @Override
    public void run(String... args) throws Exception {  // ← 여기만 다름!
        log.info("Quest 초기 데이터 삽입 시작...");

        // 이미 데이터가 있으면 스킵
        long count = questRepository.count();
        if (count > 0) {
            log.info("Quest 데이터가 이미 존재합니다: {}개", count);
            return;
        }

        // 테마 1 (프로젝트 에이아) - 3개 퀘스트
        questRepository.save(Quest.builder()
                .themeId(1L)
                .questOrder(1)
                .title("프로젝트 초기 설정")
                .description("Spring Boot 프로젝트를 생성하고 기본 설정을 완료하세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questRepository.save(Quest.builder()
                .themeId(1L)
                .questOrder(2)
                .title("데이터베이스 연동")
                .description("MySQL 데이터베이스를 연결하고 Entity를 작성하세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questRepository.save(Quest.builder()
                .themeId(1L)
                .questOrder(3)
                .title("REST API 구현")
                .description("CRUD API를 구현하고 테스트하세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 테마 2 - 3개 퀘스트
        questRepository.save(Quest.builder()
                .themeId(2L)
                .questOrder(1)
                .title("컴포넌트 구조 설계")
                .description("React 컴포넌트 구조를 설계하고 기본 레이아웃을 작성하세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questRepository.save(Quest.builder()
                .themeId(2L)
                .questOrder(2)
                .title("상태 관리 구현")
                .description("Redux 또는 Context API로 상태 관리를 구현하세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        questRepository.save(Quest.builder()
                .themeId(2L)
                .questOrder(3)
                .title("API 연동")
                .description("백엔드 API와 연동하여 데이터를 주고받으세요.")
                .isDeleted(TrueOrFalse.F)
                .build());

        long finalCount = questRepository.count();
        log.info("Quest 초기 데이터 삽입 완료! 총 {}개", finalCount);
    }
}