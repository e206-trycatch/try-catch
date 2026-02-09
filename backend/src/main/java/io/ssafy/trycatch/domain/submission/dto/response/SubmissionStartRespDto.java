package io.ssafy.trycatch.domain.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionStartRespDto {
    private Long roomId;
    private LocalDateTime submittedAt;
}
