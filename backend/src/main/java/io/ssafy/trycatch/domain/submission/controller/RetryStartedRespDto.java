package io.ssafy.trycatch.domain.submission.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetryStartedRespDto {
    private Long roomId;
}