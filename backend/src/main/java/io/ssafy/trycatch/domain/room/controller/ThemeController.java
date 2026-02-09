package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.dto.response.ThemeListRespDto;
import io.ssafy.trycatch.domain.room.service.ThemeService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

    // 테마 목록 조회
    @GetMapping
    public ResponseEntity<ApiRespDto<ThemeListRespDto>> getThemeList() {
        log.info("테마 목록 조회 API 호출");
        ThemeListRespDto response = themeService.getThemeList();

        return ResponseEntity.ok(
                ApiRespDto.success("테마 목록 불러오기에 성공하였습니다.", response)
        );
    }
}