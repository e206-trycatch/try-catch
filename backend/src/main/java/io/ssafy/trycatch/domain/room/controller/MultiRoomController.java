package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.dto.response.MultiRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.service.MultiRoomService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}