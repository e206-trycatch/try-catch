package io.ssafy.trycatch.domain.user.dto.response;

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
    }

    public static RefreshRespDto success(String accessToken) {
        return RefreshRespDto.builder()
                .message("토큰이 재발급되었습니다.")
                .result(Result.builder()
                        .accessToken(accessToken)
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