package io.ssafy.trycatch.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다"),

    // 인증
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "다시 로그인해주세요."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해주세요"),


    // 회원
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다"),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다"),
    // 테마
//    THEME_NOT_FOUND(HttpStatus.NOT_FOUND, "테마를 찾을 수 없습니다"),

    // 대기방
    HOST_NOT_FOUND(HttpStatus.NOT_FOUND, "Host를 찾을 수 없습니다."),
    GUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "Guest를 찾을 수 없습니다."),

    // 문제
//    PROBLEM_NOT_FOUND(HttpStatus.NOT_FOUND, "문제를 찾을 수 없습니다");
    GAMEOVER(HttpStatus.BAD_REQUEST, "게임이 종료되었습니다. 남은 목숨이 없습니다."),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 방입니다."),
    SUBMISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "제출 내역이 없습니다."),
    UNAUTHORIZED_SUBMISSION_ACCESS(HttpStatus.FORBIDDEN, "해당 제출에 접근할 권한이 없습니다"),
    DUPLICATE_SUBMISSION(HttpStatus.TOO_MANY_REQUESTS, "제출 요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요"),
    PROBLEM_FRAMEWORK_NOT_FOUND(HttpStatus.NOT_FOUND, "문제 프레임워크를 찾을 수 없습니다"),
    FRAMEWORK_NOT_FOUND(HttpStatus.NOT_FOUND, "프레임워크를 찾을 수 없습니다"),
    FILE_UPLOAD_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드 실패"),

    NOT_HOST(HttpStatus.FORBIDDEN, "방장만 코드를 제출할 수 있습니다."),
    ROOM_USER_NOT_FOUND(HttpStatus.NOT_FOUND, "방 참가 유저를 찾을 수 없습니다."),
    USER_NOT_IN_ROOM(HttpStatus.NOT_FOUND, "유저가 해당 방에 존재하지 않습니다."),
    QUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "퀘스트를 찾을 수 없습니다."),
    SUBMISSION_ALREADY_PENDING(HttpStatus.CONFLICT, "이미 처리 중인 제출이 있습니다.")
    ;

    private final HttpStatus status;
    private final String message;

}