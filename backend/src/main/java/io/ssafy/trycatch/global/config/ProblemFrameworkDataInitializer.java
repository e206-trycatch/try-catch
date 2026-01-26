package io.ssafy.trycatch.global.config;

import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.domain.room.repository.ProblemFrameworkRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProblemFrameworkDataInitializer implements CommandLineRunner {

    private final ProblemFrameworkRepository problemFrameworkRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("ProblemFramework 초기 데이터 삽입 시작...");

        // 이미 데이터가 있으면 스킵
        long count = problemFrameworkRepository.count();
        if (count > 0) {
            log.info("ProblemFramework 데이터가 이미 존재합니다: {}개", count);
            return;
        }

        // ========== Quest 1 - 8가지 조합 ==========
        // Framework ID 통일:
        // FRONTEND: 1=React, 2=Vue
        // BACKEND: 3=Spring, 4=Django

        // 1. Quest 1 - FRONTEND (React만)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(1L)   // React
                .backendId(null)  // 백엔드 없음
                .frontendErrorLog("Expected identifier at line 10. Check your component syntax.")
                .backendErrorLog(null)
                .isDeleted(TrueOrFalse.F)
                .build());

        // 2. Quest 1 - FRONTEND (Vue만)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(2L)   // Vue
                .backendId(null)  // 백엔드 없음
                .frontendErrorLog("Property or method 'items' is not defined. Check your data method.")
                .backendErrorLog(null)
                .isDeleted(TrueOrFalse.F)
                .build());

        // 3. Quest 1 - BACKEND (Spring만)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(null)  // 프론트엔드 없음
                .backendId(3L)     // Spring
                .frontendErrorLog(null)
                .backendErrorLog("NullPointerException in UserService.findById(). Verify the repository call.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 4. Quest 1 - BACKEND (Django만)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(null)  // 프론트엔드 없음
                .backendId(4L)     // Django
                .frontendErrorLog(null)
                .backendErrorLog("AttributeError: 'NoneType' object has no attribute 'id'. Check your query.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 5. Quest 1 - FULLSTACK (React + Spring)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(1L)  // React
                .backendId(3L)   // Spring
                .frontendErrorLog("Expected identifier at line 10. Check your component syntax.")
                .backendErrorLog("NullPointerException in UserService.findById(). Verify the repository call.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 6. Quest 1 - FULLSTACK (React + Django)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(1L)  // React
                .backendId(4L)   // Django
                .frontendErrorLog("Expected identifier at line 10. Check your component syntax.")
                .backendErrorLog("AttributeError: 'NoneType' object has no attribute 'id'. Check your query.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 7. Quest 1 - FULLSTACK (Vue + Spring)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(2L)  // Vue
                .backendId(3L)   // Spring
                .frontendErrorLog("Property or method 'items' is not defined. Check your data method.")
                .backendErrorLog("NullPointerException in UserService.findById(). Verify the repository call.")
                .isDeleted(TrueOrFalse.F)
                .build());

        // 8. Quest 1 - FULLSTACK (Vue + Django)
        problemFrameworkRepository.save(ProblemFramework.builder()
                .questId(1L)
                .frontendId(2L)  // Vue
                .backendId(4L)   // Django
                .frontendErrorLog("Property or method 'items' is not defined. Check your data method.")
                .backendErrorLog("AttributeError: 'NoneType' object has no attribute 'id'. Check your query.")
                .isDeleted(TrueOrFalse.F)
                .build());

        long finalCount = problemFrameworkRepository.count();
        log.info("ProblemFramework 초기 데이터 삽입 완료! 총 {}개", finalCount);
    }
}