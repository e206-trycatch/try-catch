package io.ssafy.trycatch.domain.game.controller;

import io.ssafy.trycatch.domain.room.dto.response.GameStartRespDto;
import io.ssafy.trycatch.domain.game.dto.response.TimerStatusRespDto;
import io.ssafy.trycatch.domain.room.service.SingleRoomService;
import io.ssafy.trycatch.domain.game.service.TimerService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class TimerController {

    private final SingleRoomService singleRoomService;
    private final TimerService timerService;

    // 게임 시작
    @PostMapping("/single/{roomId}/start")
    public ResponseEntity<ApiRespDto<GameStartRespDto>> startGame(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {
        GameStartRespDto result = timerService.startGame(roomId, userId);
        return ResponseEntity.ok(
                ApiRespDto.success("게임이 시작되었습니다.", result)
        );
    }

    // 멀티 모드 게임 시작
    @PostMapping("/multi/{roomId}/start")
    public ResponseEntity<ApiRespDto<GameStartRespDto>> startMultiGame(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {
        GameStartRespDto result = timerService.markUserReady(roomId, userId);
        return ResponseEntity.ok(
                ApiRespDto.success(result)
        );
    }

    @GetMapping("/single/{roomId}/timer")
    public ResponseEntity<ApiRespDto<TimerStatusRespDto>> getTimerStatus(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId) {

        TimerStatusRespDto result = timerService.getSingleTimerStatus(roomId, userId);
        return ResponseEntity.ok(
                ApiRespDto.success(result)
        );
    }

}
