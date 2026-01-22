package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.domain.room.dto.response.SingleRoomSettingRespDto;
import io.ssafy.trycatch.domain.room.service.SingleRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class SingleRoomController {

    private final SingleRoomService singleRoomService;

    @GetMapping("/single")
    public ResponseEntity<ApiRespDto<SingleRoomSettingRespDto>> getSingleRoomSettings(
            @RequestParam Long themeId) {

        SingleRoomSettingRespDto response = singleRoomService.getSingleRoomSettings(themeId);

        return ResponseEntity.ok(
                ApiRespDto.success("싱글 플레이 설정 데이터를 불러왔습니다.", response)
        );
    }
}