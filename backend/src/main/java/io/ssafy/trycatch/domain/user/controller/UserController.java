package io.ssafy.trycatch.domain.user.controller;

import io.ssafy.trycatch.domain.user.dto.response.UserProfileRespDto;
import io.ssafy.trycatch.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 프로필 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileRespDto> getMyProfile() {
        Long userId = getCurrentUserId();
        log.info("프로필 조회 API 호출 - userId: {}", userId);

        UserProfileRespDto response = userService.getProfile(userId);

        return ResponseEntity.ok(response);
    }

    // SecurityContext에서 userId 추출
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }

}