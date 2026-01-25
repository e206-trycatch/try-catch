package io.ssafy.trycatch.domain.user.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DuplicateCheckRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private boolean available;
    }

    public static DuplicateCheckRespDto available(String message) {
        return DuplicateCheckRespDto.builder()
                .message(message)
                .result(Result.builder().available(true).build())
                .build();
    }

    public static DuplicateCheckRespDto duplicate(String message) {
        return DuplicateCheckRespDto.builder()
                .message(message)
                .result(Result.builder().available(false).build())
                .build();
    }
}