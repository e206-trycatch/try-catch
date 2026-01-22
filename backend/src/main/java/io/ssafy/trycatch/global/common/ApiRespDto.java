package io.ssafy.trycatch.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class ApiRespDto<T> {

    private String message;
    private T result;

    public static <T> ApiRespDto<T> success(String message, T data) {
        return new ApiRespDto<>(message, data);
    }

    public static <T> ApiRespDto<T> success(T data) {
        return new ApiRespDto<>("요청이 성공적으로 처리되었습니다.", data);
    }

    public static <T> ApiRespDto<T> error(String message) {
        return new ApiRespDto<>(message, null);
    }
}