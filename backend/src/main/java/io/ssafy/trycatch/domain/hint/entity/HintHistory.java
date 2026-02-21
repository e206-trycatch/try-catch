package io.ssafy.trycatch.domain.hint.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Redis에 저장할 힌트 이력 DTO
 * (Entity 없이 RedisTemplate으로 직접 저장)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintHistory {

    private Long roomId;
    private Long userId;
    private Long problemFrameworkId;
    private String framework;
    private String userQuestion;
    private String hintContent;
    private boolean guardrailPassed;
    private String rejectionReason;
    private LocalDateTime createdAt;

    /**
     * Redis Key 생성
     */
    public static String generateKey(Long roomId, Long userId, LocalDateTime timestamp) {
        long millis = timestamp.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
        return String.format("hint:%d:%d:%d", roomId, userId, millis);
    }
}