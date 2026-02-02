package io.ssafy.trycatch.domain.room.service;

import io.ssafy.trycatch.domain.room.dto.response.TimeOutEventDto;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.room.repository.RoomUserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.common.TimeLimitPolicy;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimeoutSchedulerService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;

    private final Map<Long, ScheduledFuture<?>> scheduledTimeouts = new ConcurrentHashMap<>();

    /**
     * 게임 시작 시 타임아웃 스케줄 등록
     */
    public void scheduleTimeout(Long roomId, LocalDateTime deadlineAt) {
        // 기존 스케줄이 있으면 취소
        cancelTimeout(roomId);

        Instant instant = deadlineAt.atZone(ZoneId.systemDefault()).toInstant();

        ScheduledFuture<?> future = taskScheduler.schedule(
                () -> handleTimeout(roomId, deadlineAt),
                instant
        );

        scheduledTimeouts.put(roomId, future);
        log.info("타임아웃 스케줄 등록 - roomId: {}, deadlineAt: {}", roomId, deadlineAt);
    }

    /**
     * 타임아웃 스케줄 취소 (게임 종료, 방 삭제 시)
     */
    public void cancelTimeout(Long roomId) {
        ScheduledFuture<?> future = scheduledTimeouts.remove(roomId);
        if (future != null && !future.isDone()) {
            future.cancel(false);
            log.info("타임아웃 스케줄 취소 - roomId: {}", roomId);
        }
    }

    private void handleTimeout(Long roomId, LocalDateTime deadlineAt) {
        try {
            log.info("타임아웃 발생 - roomId: {}, deadlineAt: {}", roomId, deadlineAt);

            // 웹소켓으로 타임아웃 이벤트 전송
            TimeOutEventDto data = TimeOutEventDto.builder()
                    .roomId(roomId)
                    .message("제한 시간이 초과되었습니다.")
                    .deadlineAt(deadlineAt)
                    .build();

            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/game",
                    SocketRespDto.of(SocketEventType.TIME_OUT, data)
            );

            log.info("타임아웃 이벤트 전송 완료 - roomId: {}", roomId);

            // 스케줄 맵에서 제거
            scheduledTimeouts.remove(roomId);

        } catch (Exception e) {
            log.error("타임아웃 처리 중 오류 발생 - roomId: {}", roomId, e);
        }
    }
}