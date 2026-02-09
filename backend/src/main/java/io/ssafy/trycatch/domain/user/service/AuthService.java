package io.ssafy.trycatch.domain.user.service;

import io.ssafy.trycatch.domain.user.dto.request.LoginReqDto;
import io.ssafy.trycatch.domain.user.dto.request.SignupReqDto;
import io.ssafy.trycatch.domain.user.dto.response.RefreshRespDto;
import io.ssafy.trycatch.domain.user.dto.response.SignupRespDto;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.auth.jwt.JwtTokenProvider;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.http.HttpRequest;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 로그인
    @Transactional
    public LoginResult login(LoginReqDto request) {

        // 아이디로 회원 찾기
        User user = userRepository.findByLoginIdAndIsDeleted(request.getLoginId(), TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.LOGIN_FAILED));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

        // 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        log.info("로그인 성공 - userId: {}", user.getId());

        return new LoginResult(accessToken, refreshToken, user);
    }

    public record LoginResult(String accessToken, String refreshToken, User user) {}

    @Transactional
    public RefreshRespDto refresh(String refreshToken){

        if(!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        User user = userRepository.findByIdAndIsDeleted(userId, TrueOrFalse.F)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // accesstoken 새로 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(userId);

        log.info("토큰 재발급 완료 - userID: {}", userId);

        return RefreshRespDto.success(newAccessToken, user);
    }

    // 회원가입
    @Transactional
    public SignupRespDto signup(SignupReqDto request) {

        // 중복 이중 체크
        if (userRepository.existsByLoginIdAndIsDeleted(request.getLoginId(), TrueOrFalse.F)) {
            throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByEmailAndIsDeleted(request.getEmail(), TrueOrFalse.F)) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByNicknameAndIsDeleted(request.getNickname(), TrueOrFalse.F)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        // User 테이블에 insert
        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .email(request.getEmail())
                .profileUrl("https://i14e206.p.ssafy.io/api/v1/files/image/user/b9be7099-72a0-4ba0-be74-f31ba78495df_default_profile.png")
                .isDeleted(TrueOrFalse.F)
                .build();

        User savedUser = userRepository.save(user);
        log.info("회원가입 완료: {}", savedUser.getId());

        return SignupRespDto.from(savedUser); //
    }

    // 아이디 중복 체크
    public boolean checkLoginIdDuplicate(String loginId) {
        return userRepository.existsByLoginIdAndIsDeleted(loginId, TrueOrFalse.F);
    }

    // 닉네임 중복 체크
    public boolean checkNicknameDuplicate(String nickname) {
        return userRepository.existsByNicknameAndIsDeleted(nickname, TrueOrFalse.F);
    }

    // 이메일 중복 체크
    public boolean checkEmailDuplicate(String email){
        return userRepository.existsByEmailAndIsDeleted(email, TrueOrFalse.F);
    }

}