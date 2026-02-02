package io.ssafy.trycatch.domain.room.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GameStartRespDto {
    private Long roomId;
    private RoomStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime deadlineAt;
}