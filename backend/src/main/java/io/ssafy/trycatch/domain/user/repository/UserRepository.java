package io.ssafy.trycatch.domain.user.repository;

import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인 시 사용
    Optional<User> findByLoginIdAndIsDeleted(String loginId, TrueOrFalse isDeleted);

    // 중복 체크
    boolean existsByLoginIdAndIsDeleted(String loginId, TrueOrFalse isDeleted);

    boolean existsByNicknameAndIsDeleted(String nickname, TrueOrFalse isDeleted);

    boolean existsByEmailAndIsDeleted(String email, TrueOrFalse isDeleted);
}