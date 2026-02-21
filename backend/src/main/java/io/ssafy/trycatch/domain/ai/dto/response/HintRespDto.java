package io.ssafy.trycatch.domain.ai.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintRespDto {

    private boolean success;

    private String hint;

    @JsonProperty("guardrail_passed")
    private boolean guardrailPassed;

    @JsonProperty("rejection_reason")
    private String rejectionReason;
}