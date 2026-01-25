package io.ssafy.trycatch.domain.user.service;

import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;

    // 아이디 중복 체크
    public boolean checkLoginIdDuplicate(String loginId) {
        return userRepository.existsByLoginIdAndIsDeleted(loginId, TrueOrFalse.F);
    }

    // 닉네임 중복 체크
    public boolean checkNicknameDuplicate(String nickname) {
        return userRepository.existsByNicknameAndIsDeleted(nickname, TrueOrFalse.F);
    }

}