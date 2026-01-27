package io.ssafy.trycatch.domain.user.controller;

import io.ssafy.trycatch.domain.user.dto.request.LoginReqDto;
import io.ssafy.trycatch.domain.user.dto.request.SignupReqDto;
import io.ssafy.trycatch.domain.user.dto.response.DuplicateCheckRespDto;
import io.ssafy.trycatch.domain.user.dto.response.LoginRespDto;
import io.ssafy.trycatch.domain.user.dto.response.RefreshRespDto;
import io.ssafy.trycatch.domain.user.dto.response.SignupRespDto;
import io.ssafy.trycatch.domain.user.service.AuthService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginRespDto> login(
            @Valid @RequestBody LoginReqDto request, HttpServletResponse response) { // cookie 정보 위해 HttpServletResponse 객체 필요
        log.info("로그인 API 호출: {}", request.getLoginId());

        AuthService.LoginResult result = authService.login(request);

        Cookie refreshTokenCookie = new Cookie("refreshToken", result.refreshToken());
        refreshTokenCookie.setHttpOnly(true);      // JavaScript 접근 불가
        refreshTokenCookie.setSecure(false);       // 개발 환경: false, 운영 환경(HTTPS): true
        refreshTokenCookie.setPath("/");           // 모든 경로에서 쿠키 전송
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);  // 7일 (초 단위)
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(LoginRespDto.success(result.accessToken(), result.user()));
    }

    // 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<RefreshRespDto> refresh(HttpServletRequest request) {
        log.info("토큰 재발급 API 호출");

        // 쿠키에서 Refresh Token 추출
        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(RefreshRespDto.fail("Refresh Token이 없습니다."));
        }

        RefreshRespDto response = authService.refresh(refreshToken);
        return ResponseEntity.ok(response);
    }

    // 쿠키에서 Refresh Token 추출
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiRespDto<Void>> logout(HttpServletResponse response) {
        log.info("로그아웃 API 호출");

        // Refresh Token 쿠키 삭제
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(ApiRespDto.success("로그아웃이 완료되었습니다.", null));
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<SignupRespDto> signup(
            @Valid @RequestBody SignupReqDto request) {
        log.info("회원가입 API 호출: {}", request.getLoginId());
        SignupRespDto response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 아이디 중복 체크
    @GetMapping("/check-loginId")
    public ResponseEntity<DuplicateCheckRespDto> checkLoginId(
            @RequestParam String loginId) {
        log.info("아이디 중복 체크 API 호출: {}", loginId);
        boolean isDuplicate = authService.checkLoginIdDuplicate(loginId);

        if (isDuplicate) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(DuplicateCheckRespDto.duplicate("이미 사용 중인 아이디입니다."));
        }

        return ResponseEntity.ok(DuplicateCheckRespDto.available("사용 가능한 아이디입니다."));
    }

    // 닉네임 중복 체크
    @GetMapping("/check-nickname")
    public ResponseEntity<DuplicateCheckRespDto> checkNickname(
            @RequestParam String nickname) {
        log.info("닉네임 중복 체크 API 호출: {}", nickname);
        boolean isDuplicate = authService.checkNicknameDuplicate(nickname);

        if (isDuplicate) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(DuplicateCheckRespDto.duplicate("이미 사용 중인 닉네임입니다."));
        }

        return ResponseEntity.ok(DuplicateCheckRespDto.available("사용 가능한 닉네임입니다."));
    }

    // 이메일 중복 체크
    @GetMapping("/check-email")
    public ResponseEntity<DuplicateCheckRespDto> checkEmail(
            @RequestParam String email) {
        log.info("이메일 중복 체크 API 호출: {}", email);
        boolean isDuplicate = authService.checkEmailDuplicate(email);

        if (isDuplicate) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(DuplicateCheckRespDto.duplicate("해당 이메일로 가입된 계정이 있습니다."));
        }

        return ResponseEntity.ok(DuplicateCheckRespDto.available("사용 가능한 이메일입니다."));
    }
}