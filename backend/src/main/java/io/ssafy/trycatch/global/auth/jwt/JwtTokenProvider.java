package io.ssafy.trycatch.global.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.global.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    private SecretKey key;

    @PostConstruct
    protected void init() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // Access Token 생성
    public String createAccessToken(Long userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidity);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(Long userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type","refresh")
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    // 토큰에서 userId 추출
    public Long getUserId(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("만료된 토큰입니다: {}", e.getMessage());
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("유효하지 않은 토큰입니다: {}", e.getMessage());
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }

    // Refresh Token 검증 (재발급용 - 만료/유효하지 않음 구분)
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            // refresh 타입인지 확인
            String type = claims.get("type", String.class);
            if (!"refresh".equals(type)) {
                log.error("Refresh Token이 아닙니다");
                return false;
            }
            return true;
        } catch (ExpiredJwtException e) {
            log.error("만료된 Refresh Token입니다");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("유효하지 않은 Refresh Token입니다");
            return false;
        }
    }

    // 만료된 토큰에서 userId 추출 (재발급용)
    public Long getUserIdFromExpiredToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return Long.parseLong(claims.getSubject());
        } catch (ExpiredJwtException e) {
            return Long.parseLong(e.getClaims().getSubject());
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}