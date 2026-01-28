package io.ssafy.trycatch.domain.user.dto.response;

import io.ssafy.trycatch.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefreshRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private String accessToken;
        private String nickname;
        private String profileUrl;
    }

    public static RefreshRespDto success(String accessToken, User user) {
        return RefreshRespDto.builder()
                .message("토큰이 재발급되었습니다.")
                .result(Result.builder()
                        .accessToken(accessToken)
                        .nickname(user.getNickname())
                        .profileUrl(user.getProfileUrl())
                        .build())
                .build();
    }

    public static RefreshRespDto fail(String message) {
        return RefreshRespDto.builder()
                .message(message)
                .result(null)
                .build();
    }
}