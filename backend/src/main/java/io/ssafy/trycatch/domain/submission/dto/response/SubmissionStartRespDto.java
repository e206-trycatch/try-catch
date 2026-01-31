package io.ssafy.trycatch.domain.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionStartRespDto {
    private Long userId;
    private String nickname;
    private String message;
}
