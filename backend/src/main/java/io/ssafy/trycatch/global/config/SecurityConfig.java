package io.ssafy.trycatch.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)      // csrf 비활성화
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // 인증 필요 없는 API 전부 허용
                        .requestMatchers("/api/*/main").permitAll()
                        .requestMatchers("/api/*/auth/**").permitAll()
                        // TODO: JWT 적용 후 authenticated()로 변경
                        .anyRequest().permitAll()

                )
                // 기본 로그인 폼/Basic Auth 팝업 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }

    // 비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

