package io.ssafy.trycatch.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RefreshReqDto {

    @NotBlank(message = "Refresh Token은 필수입니다")
    private String refreshToken;
}