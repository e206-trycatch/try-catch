package io.ssafy.trycatch.domain.room.handler;

import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Room 도메인 전용 예외 처리 핸들러
@Slf4j
@RestControllerAdvice(basePackages = "io.ssafy.trycatch.domain.room")  // ← room 패키지에서만 동작!
public class RoomExceptionHandler {

    // 400 Bad Request - IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiRespDto<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        log.warn("Room API 요청 실패: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiRespDto.error(ex.getMessage()));
    }

    // 500 Internal Server Error - 예상치 못한 에러
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiRespDto<Void>> handleGeneralException(Exception ex) {

        log.error("Room API 서버 에러 발생: ", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiRespDto.error("서버에 에러가 발생하였습니다."));
    }
}