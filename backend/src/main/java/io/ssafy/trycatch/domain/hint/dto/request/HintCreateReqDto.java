package io.ssafy.trycatch.domain.hint.dto.request;

import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class HintCreateReqDto {
    private Long problemFrameworkId;
    private String framework;
    private String userQuestion;
    private SubmissionReqDto submission;
}