package io.ssafy.trycatch.domain.user.dto.response;

import io.ssafy.trycatch.domain.user.entity.User;
import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class LoginRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private String accessToken;
        private String nickname;
        private String profileUrl;
    }

    public static LoginRespDto success(String accessToken, User user) {
        return LoginRespDto.builder()
                .message("로그인에 성공하였습니다.")
                .result(Result.builder()
                        .accessToken(accessToken)
                        .nickname(user.getNickname())
                        .profileUrl(user.getProfileUrl())
                        .build())
                .build();
    }
}