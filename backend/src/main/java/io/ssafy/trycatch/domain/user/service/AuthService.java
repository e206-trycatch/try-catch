package io.ssafy.trycatch.domain.user.service;

import io.ssafy.trycatch.domain.user.dto.request.SignupReqDto;
import io.ssafy.trycatch.domain.user.dto.response.SignupRespDto;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        User user = new User(
                null,  // id (자동 생성)
                request.getLoginId(),
                passwordEncoder.encode(request.getPassword()),
                request.getNickname(),
                request.getEmail(),
                null,  // profileUrl
                null,  // createdAt (자동)
                null,  // updatedAt (자동)
                TrueOrFalse.F
        );

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