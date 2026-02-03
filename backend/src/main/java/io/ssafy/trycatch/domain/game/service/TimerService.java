package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.room.dto.response.GameStartRespDto;
import io.ssafy.trycatch.domain.game.dto.response.TimerStatusRespDto;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.*;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.common.TimeLimitPolicy;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import io.ssafy.trycatch.websocket.dto.game.TimerStartedDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

import static io.ssafy.trycatch.global.exception.ErrorCode.ROOM_USER_NOT_FOUND;
import static io.ssafy.trycatch.global.exception.ErrorCode.USER_NOT_IN_ROOM;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimerService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final TimeoutSchedulerService timeoutSchedulerService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public GameStartRespDto startGame(Long roomId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 방을 찾을 수 없습니다. roomId: " + roomId));

        RoomUser roomUser = roomUserRepository.findByRoomIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_USER_NOT_FOUND));

        Duration limit = TimeLimitPolicy.resolve(room.getMode());
        room.startQuestGame();
        LocalDateTime deadlineAt = room.getStartedAt().plus(limit);

        timeoutSchedulerService.scheduleTimeout(roomId, deadlineAt);

        log.info("게임 시작 - roomId: {}, status: {}, startedAt: {}, deadlineAt: {}",
                roomId, room.getStatus(), room.getStartedAt(), deadlineAt);

        return GameStartRespDto.builder()
                .roomId(room.getId())
                .status(room.getStatus())
                .startedAt(room.getStartedAt())
                .deadlineAt(deadlineAt)
                .build();
    }

    @Transactional
    public GameStartRespDto startGameWithBroadcast(Long roomId) {
        GameStartRespDto result = startGame(roomId);

        // 웹소켓으로 타이머 시작 브로드캐스트
        TimerStartedDto syncData = TimerStartedDto.builder()
                .roomId(result.getRoomId())
                .startedAt(result.getStartedAt())
                .deadlineAt(result.getDeadlineAt())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.TIMER_STARTED, syncData)
        );

        log.info("타이머 시작 브로드캐스트 완료 - roomId: {}", roomId);

        return result;
    }

    @Transactional(readOnly = true)
    public TimerStatusRespDto getSingleTimerStatus(Long roomId, Long userId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 방을 찾을 수 없습니다. roomId: " + roomId));

        RoomUser ru = roomUserRepository.findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(USER_NOT_IN_ROOM));

        LocalDateTime now = LocalDateTime.now();

        if (room.getStartedAt() == null || room.getStatus() == RoomStatus.CREATED) {
            return TimerStatusRespDto.builder()
                    .roomId(room.getId())
                    .status(room.getStatus())
                    .serverNow(now)
                    .startedAt(room.getStartedAt())
                    .deadlineAt(null)
                    .remainingSeconds(0)
                    .expired(false)
                    .build();
        }

        Duration limit = TimeLimitPolicy.resolve(room.getMode());
        LocalDateTime deadlineAt = room.getStartedAt().plus(limit);

        long remaining = Duration.between(now, deadlineAt).getSeconds();
        if (remaining < 0) remaining = 0;

        return TimerStatusRespDto.builder()
                .roomId(room.getId())
                .status(room.getStatus())
                .serverNow(now)
                .startedAt(room.getStartedAt())
                .deadlineAt(deadlineAt)
                .remainingSeconds(remaining)
                .expired(remaining == 0)
                .build();
    }
}
