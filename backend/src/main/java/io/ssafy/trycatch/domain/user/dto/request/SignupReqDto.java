package io.ssafy.trycatch.domain.user.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupReqDto {

    @NotBlank(message = "아이디는 필수입니다")
    @Size(min = 4, max = 20, message = "아이디는 4~20자여야 합니다")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "아이디는 영문, 숫자만 가능합니다")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "비밀번호는 영문과 숫자를 포함해야 합니다")
    private String password;

    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 12, message = "닉네임은 12자 이하여야 합니다")
    private String nickname;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email;
}