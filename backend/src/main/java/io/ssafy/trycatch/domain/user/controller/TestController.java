package io.ssafy.trycatch.domain.user.controller;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class TestController {

    // application.yml의 jwt: secret: 값을 주입받습니다.
    @Value("${jwt.secret}")
    private String jwtSecret;

    // 브라우저에서 직접 확인하고 싶을 때 사용하세요 (http://localhost:8080/test/jwt)
    @GetMapping("/test/jwt")
    public String testJwt() {
        log.info(jwtSecret);

        return "현재 설정된 JWT Secret: " + jwtSecret;
    }
}