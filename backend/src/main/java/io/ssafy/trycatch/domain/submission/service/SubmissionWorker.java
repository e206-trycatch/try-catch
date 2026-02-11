package io.ssafy.trycatch.domain.submission.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.trycatch.domain.submission.entity.Submission;
import io.ssafy.trycatch.domain.submission.entity.SubmissionTaskDto;
import io.ssafy.trycatch.domain.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubmissionWorker {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SyncScoringService syncScoringService; // 방금 만든 동기 서비스
    private final ObjectMapper objectMapper;

    // 🚀 동시에 10개까지만 채점 (DB 커넥션 보호용)
    private final ExecutorService workerPool = Executors.newFixedThreadPool(10);

    @Scheduled(fixedDelay = 100) // 0.1초마다 폴링
    public void processQueue() {
        // 1. 레디스에서 꺼냄
        Object rawTask = redisTemplate.opsForList().rightPop("submission_queue");

        if (rawTask == null) return;

        // 3. 안전하게 변환 (Map -> DTO)
        // convertValue 메서드가 마법을 부려줍니다.
        SubmissionTaskDto task = objectMapper.convertValue(rawTask, SubmissionTaskDto.class);

        // 2. 스레드 풀에 작업 투입
        workerPool.submit(() -> {
            try {
                // 3. 동기 채점 실행 (30초 소요)
                syncScoringService.scoreSync(
                        task.getSubmissionId(),
                        task.getRoomId(),
                        task.getRoleName(),
                        task.getProblemFrameworkId(),
                        task.getSubmittedAt()
                );
            } catch (Exception e) {
                log.error("워커 처리 중 에러: {}", task.getSubmissionId(), e);
            }
        });
    }
}