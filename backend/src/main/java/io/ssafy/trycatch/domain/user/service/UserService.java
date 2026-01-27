package io.ssafy.trycatch.domain.user.service;

import io.ssafy.trycatch.domain.user.dto.response.UserProfileRespDto;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    // 프로필 조회
    public UserProfileRespDto getProfile(Long userId) {
        log.info("프로필 조회 요청 - userId: {}", userId);

        // DB에서 id 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return UserProfileRespDto.success(user);
    }
}