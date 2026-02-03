package io.ssafy.trycatch.domain.game.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeOutEventRespDto {
    private Long roomId;
    private String message;
    private LocalDateTime deadlineAt;
}