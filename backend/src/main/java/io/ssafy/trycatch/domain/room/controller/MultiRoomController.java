package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.dto.request.MultiRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.response.MultiRoomCreateRespDto;
import io.ssafy.trycatch.domain.room.dto.response.MultiRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.service.MultiRoomService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms/multi")
@RequiredArgsConstructor
public class MultiRoomController {

    private final MultiRoomService multiRoomService;

    @GetMapping
    public ResponseEntity<ApiRespDto<MultiRoomSettingRespDto>> getMultiRoomSettings(
            @RequestParam Long themeId) {

        MultiRoomSettingRespDto response = multiRoomService.getMultiRoomSettings(themeId);

        return ResponseEntity.ok(
                ApiRespDto.success("멀티 플레이 설정 데이터를 불러왔습니다.", response)
        );
    }

    // 멀티 방 생성
    @PostMapping
    public ResponseEntity<ApiRespDto<MultiRoomCreateRespDto>> createMultiRoom(
            @AuthenticationPrincipal Long userId,
            @RequestBody MultiRoomCreateReqDto request) {

        MultiRoomCreateRespDto response = multiRoomService.createMultiRoom(userId, request);

        return ResponseEntity.ok(
                ApiRespDto.success("멀티 방이 생성되었습니다.", response)
        );
    }

    @PostMapping
    @RequestMapping("/delete")
    public ResponseEntity<?> leaveMultiRoom(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId) {
        multiRoomService.leaveMultiRoom(userId, roomId);
        return ResponseEntity.ok(
                ApiRespDto.success("방을 나가셨습니다.", null)
        );
    }
}