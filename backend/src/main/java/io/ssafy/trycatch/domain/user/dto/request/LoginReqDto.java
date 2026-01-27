package io.ssafy.trycatch.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginReqDto {
    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    private String loginId;
    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    private String password;
}