package io.ssafy.trycatch.domain.user.dto.response;

import io.ssafy.trycatch.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private String loginId;
        private String nickname;
        private String email;
    }

    public static SignupRespDto from(User user) {
        return SignupRespDto.builder()
                .message("회원가입이 완료되었습니다.")
                .result(Result.builder()
                        .loginId(user.getLoginId())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}