package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.game.dto.response.TimeOutEventRespDto;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.room.repository.RoomUserRepository;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
        log.info("타임아웃 스케줄 등록 - roomId: {}, deadlineAt: {}, 활성 스케줄 수: {}",
                roomId, deadlineAt, scheduledTimeouts.size());
    }

    /**
     * 타임아웃 스케줄 취소 (게임 종료, 방 삭제 시)
     */
    public void cancelTimeout(Long roomId) {
        ScheduledFuture<?> future = scheduledTimeouts.remove(roomId);
        if (future != null && !future.isDone()) {
            future.cancel(false);
            log.info("타임아웃 스케줄 취소 - roomId: {}, 남은 활성 스케줄 수: {}",
                    roomId, scheduledTimeouts.size());
        }
    }

    private void handleTimeout(Long roomId, LocalDateTime deadlineAt) {
        try {
            log.info("타임아웃 발생 - roomId: {}, deadlineAt: {}", roomId, deadlineAt);

            // 웹소켓으로 타임아웃 이벤트 전송
            TimeOutEventRespDto data = TimeOutEventRespDto.builder()
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