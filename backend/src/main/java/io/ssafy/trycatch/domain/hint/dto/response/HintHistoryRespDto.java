package io.ssafy.trycatch.domain.hint.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintHistoryRespDto {

    private String hintId;
    private Long userId;
    private String userQuestion;
    private String hintContent;
    private boolean guardrailPassed;
    private String rejectionReason;
    private LocalDateTime createdAt;
}