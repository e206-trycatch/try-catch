package io.ssafy.trycatch.global.config;

import io.ssafy.trycatch.domain.room.entity.Framework;
import io.ssafy.trycatch.domain.room.entity.Theme;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.domain.room.repository.FrameworkRepository;
import io.ssafy.trycatch.domain.room.repository.ThemeRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 임시 데이터
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoomDataInitializer implements CommandLineRunner {

    private final ThemeRepository themeRepository;
    private final FrameworkRepository frameworkRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("초기 데이터 삽입 시작...");

        if (themeRepository.count() == 0) {
            Theme theme1 = Theme.builder()
                    .name("프로젝트 에이아")
                    .description("지하축구로 기는 운을 농본 깜박 필요한다")
                    .genre("일반")
                    .level(1)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            themeRepository.save(theme1);
            log.info("Theme 1 삽입 완료");

            Theme theme2 = Theme.builder()
                    .name("폭탄 해제")
                    .description("폭탄을 해제하는 테마")
                    .genre("일반")
                    .level(2)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            themeRepository.save(theme2);
            log.info("Theme 2 삽입 완료");
        } else {
            log.info("Theme 데이터가 이미 존재합니다: {}개", themeRepository.count());
        }

        if (frameworkRepository.count() == 0) {
            Framework fw1 = Framework.builder()
                    .name("Spring Boot")
                    .language("Java")
                    .category(FrameworkCategory.BACKEND)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            frameworkRepository.save(fw1);
            log.info("Framework 1 삽입 완료");

            Framework fw2 = Framework.builder()
                    .name("React")
                    .language("JavaScript")
                    .category(FrameworkCategory.FRONTEND)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            frameworkRepository.save(fw2);
            log.info("Framework 2 삽입 완료");

            Framework fw3 = Framework.builder()
                    .name("Vue.js")
                    .language("JavaScript")
                    .category(FrameworkCategory.FRONTEND)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            frameworkRepository.save(fw3);
            log.info("Framework 3 삽입 완료");

            Framework fw4 = Framework.builder()
                    .name("Node.js")
                    .language("JavaScript")
                    .category(FrameworkCategory.BACKEND)
                    .isDeleted(TrueOrFalse.F)
                    .build();
            frameworkRepository.save(fw4);
            log.info("Framework 4 삽입 완료");
        } else {
            log.info("Framework 데이터가 이미 존재합니다: {}개", frameworkRepository.count());
        }

        log.info("초기 데이터 삽입 완료! Theme: {}개, Framework: {}개",
                themeRepository.count(), frameworkRepository.count());
    }
}