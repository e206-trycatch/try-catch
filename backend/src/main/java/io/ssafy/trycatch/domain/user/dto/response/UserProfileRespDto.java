package io.ssafy.trycatch.domain.user.dto.response;

import io.ssafy.trycatch.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserProfileRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private Long id;
        private String loginId;
        private String nickname;
        private String email;
        private String profileUrl;
    }

    public static UserProfileRespDto success(User user) {
        return UserProfileRespDto.builder()
                .message("프로필 조회가 완료되었습니다.")
                .result(Result.builder()
                        .id(user.getId())
                        .loginId(user.getLoginId())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .profileUrl(user.getProfileUrl())
                        .build())
                .build();
    }
}