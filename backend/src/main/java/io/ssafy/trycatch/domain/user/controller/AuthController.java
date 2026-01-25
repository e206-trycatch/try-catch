package io.ssafy.trycatch.domain.user.controller;

import io.ssafy.trycatch.domain.user.dto.request.SignupReqDto;
import io.ssafy.trycatch.domain.user.dto.response.DuplicateCheckRespDto;
import io.ssafy.trycatch.domain.user.dto.response.SignupRespDto;
import io.ssafy.trycatch.domain.user.service.AuthService;
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