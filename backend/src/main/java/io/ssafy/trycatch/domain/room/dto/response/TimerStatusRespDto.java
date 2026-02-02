package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TimerStatusRespDto {
    private Long roomId;
    private RoomStatus status;

    private LocalDateTime serverNow;
    private LocalDateTime startedAt;
    private LocalDateTime deadlineAt;

    private long remainingSeconds;
    private boolean expired;
}