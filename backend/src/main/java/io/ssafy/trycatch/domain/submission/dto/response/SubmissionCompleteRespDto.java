package io.ssafy.trycatch.domain.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionCompleteRespDto {
    private Long submissionId;  // GET 요청할 때 필요
}