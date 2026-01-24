package io.ssafy.trycatch.domain.user.controller;

import io.ssafy.trycatch.domain.user.service.AuthService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 아이디 중복 체크
    @GetMapping("/check-loginId")
    public ResponseEntity<ApiRespDto<Map<String, Boolean>>> checkLoginId(
            @RequestParam String loginId) {
        log.info("아이디 중복 체크 API 호출: {}", loginId);
        boolean isDuplicate = authService.checkLoginIdDuplicate(loginId);

        if (isDuplicate) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ApiRespDto.error("이미 사용중인 아이디입니다"));
        }

        return ResponseEntity.ok(ApiRespDto.success("사용 가능한 아이디입니다", null));
    }

}