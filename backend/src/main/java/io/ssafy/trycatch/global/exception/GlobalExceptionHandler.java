package io.ssafy.trycatch.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // CustomException(커스텀 예외) 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, Object>> handleCustomException(CustomException e) {
        log.error("CustomException: {}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getErrorCode().getMessage());
        response.put("result", null);

        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(response);
    }

    // Validation 관련 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        log.error("Validation Error: {}", errors);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "입력값이 올바르지 않습니다");
        response.put("result", errors);

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    // 기타 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "서버 오류가 발생했습니다");
        response.put("result", null);

        return ResponseEntity
                .internalServerError()
                .body(response);
    }
}