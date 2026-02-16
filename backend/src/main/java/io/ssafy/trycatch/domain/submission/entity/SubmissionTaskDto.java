package io.ssafy.trycatch.domain.submission.entity;

import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionTaskDto implements Serializable {
    private Long submissionId;
    private Long roomId;
    private Long problemFrameworkId;
    private String roleName;
    private LocalDateTime submittedAt;
}