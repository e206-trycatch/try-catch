package io.ssafy.trycatch.domain.hint.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Redis에 저장할 힌트 채팅 메시지
 * (질문과 답변 모두 저장)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintChatMessage {

    private String type;  // "QUESTION" or "RESPONSE" or "ERROR"
    private Long roomId;
    private Long userId;
    private String content;  // 질문 내용 or 힌트 내용
    private LocalDateTime timestamp;

    // 응답 전용 필드
    private Boolean success;
    private Boolean guardrailPassed;
    private String rejectionReason;

    /**
     * Redis Key 생성
     */
    public static String generateKey(Long roomId, LocalDateTime timestamp) {
        long millis = timestamp.atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        return String.format("hint-chat:%d:%d", roomId, millis);
    }
}