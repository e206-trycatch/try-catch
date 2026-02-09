package io.ssafy.trycatch.domain.ai.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintReqDto {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("problem_id")
    private String problemId;

    @JsonProperty("framework")
    private String framework;  // "django", "spring", "vue"

    @JsonProperty("problem_description")
    private String problemDescription;

    @JsonProperty("user_question")
    private String userQuestion;
}