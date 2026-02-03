package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.room.dto.response.GameStartRespDto;
import io.ssafy.trycatch.domain.game.dto.response.TimerStatusRespDto;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.entity.RoomUser;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.domain.room.repository.*;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.common.TimeLimitPolicy;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import io.ssafy.trycatch.websocket.dto.game.TimerStartedDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static io.ssafy.trycatch.global.exception.ErrorCode.*;

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
    public GameStartRespDto startGame(Long roomId, Long userId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        RoomUser roomUser = roomUserRepository
                .findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_IN_ROOM));

        Duration limit = TimeLimitPolicy.resolve(room.getMode());
        room.startGame();
        LocalDateTime deadlineAt = room.getStartedAt().plus(limit);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        timeoutSchedulerService.scheduleTimeout(roomId, deadlineAt);
                        log.info("트랜잭션 커밋 후 타임아웃 스케줄 등록 완료 - roomId: {}", roomId);
                    }

                    @Override
                    public void afterCompletion(int status) {
                        if (status == STATUS_ROLLED_BACK) {
                            log.warn("트랜잭션 롤백으로 타임아웃 스케줄 등록 취소 - roomId: {}", roomId);
                        }
                    }
                }
        );

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
    public GameStartRespDto markUserReady(Long roomId, Long userId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 1. 유저를 Ready 상태로 변경
        RoomUser roomUser = roomUserRepository
                .findByRoomIdAndUserIdAndIsDeleted(roomId, userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_IN_ROOM));

        roomUser.setGameReady(true);

        log.info("유저 Ready 상태 변경 - roomId: {}, userId: {}", roomId, userId);

        // 2. 모든 유저가 Ready인지 체크
        List<RoomUser> allUsers = roomUserRepository.findAllByRoomIdAndIsDeleted(roomId, TrueOrFalse.F);
        boolean allReady = allUsers.stream()
                .allMatch(ru -> ru.getIsGameReady() == TrueOrFalse.T);

        // 3. 모두 Ready면 게임 시작
        if (allReady) {
            startGameAfterAllReady(roomId);
        } else {
            log.info("아직 모든 유저가 준비되지 않음 - roomId: {}, ready: {}/{}",
                    roomId,
                    allUsers.stream().filter(ru -> ru.getIsGameReady() == TrueOrFalse.T).count(),
                    allUsers.size());
        }

        return GameStartRespDto.builder()
                .roomId(room.getId())
                .status(room.getStatus())
                .build();
    }

    @Transactional
    public void startGameAfterAllReady(Long roomId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        Duration limit = TimeLimitPolicy.resolve(room.getMode());
        room.startGame();
        LocalDateTime deadlineAt = room.getStartedAt().plus(limit);

        log.info("모든 유저 준비 완료 - 게임 시작: roomId: {}, startedAt: {}, deadlineAt: {}",
                roomId, room.getStartedAt(), deadlineAt);

        // 트랜잭션 커밋 후 타임아웃 스케줄 등록 및 웹소켓 브로드캐스트
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        // 타임아웃 스케줄 등록
                        timeoutSchedulerService.scheduleTimeout(roomId, deadlineAt);
                        log.info("트랜잭션 커밋 후 타임아웃 스케줄 등록 완료 - roomId: {}", roomId);

                        // 웹소켓으로 타이머 시작 브로드캐스트
                        TimerStartedDto syncData = TimerStartedDto.builder()
                                .roomId(roomId)
                                .startedAt(room.getStartedAt())
                                .deadlineAt(deadlineAt)
                                .build();

                        messagingTemplate.convertAndSend(
                                "/topic/room/" + roomId + "/game",
                                SocketRespDto.of(SocketEventType.TIMER_STARTED, syncData)
                        );

                        log.info("타이머 시작 브로드캐스트 완료 - roomId: {}", roomId);
                    }

                    @Override
                    public void afterCompletion(int status) {
                        if (status == STATUS_ROLLED_BACK) {
                            log.warn("트랜잭션 롤백으로 타임아웃 스케줄 등록 취소 - roomId: {}", roomId);
                        }
                    }
                }
        );
    }

    @Transactional(readOnly = true)
    public TimerStatusRespDto getSingleTimerStatus(Long roomId, Long userId) {
        Room room = roomRepository.findByIdAndIsDeleted(roomId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

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
