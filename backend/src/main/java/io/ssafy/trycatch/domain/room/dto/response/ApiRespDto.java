package io.ssafy.trycatch.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class ApiRespDto<T> {

    private Integer status;
    private String message;
    private T result;

    public static <T> ApiRespDto<T> success(String message, T data) {
        return new ApiRespDto<>(200, message, data);
    }

    public static <T> ApiRespDto<T> success(T data) {
        return new ApiRespDto<>(200, "요청이 성공적으로 처리되었습니다.", data);
    }

    public static <T> ApiRespDto<T> error(Integer status, String message) {
        return new ApiRespDto<>(status, message, null);
    }
}