package io.ssafy.trycatch.domain.submission.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreResult {
    private Boolean success;
    private Integer score;
    private String errorLog;

    @JsonProperty("executionTime")
    private Long executionTime;
}