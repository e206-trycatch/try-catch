# Learning.md

> ErrorScape 프로젝트 학습 기록
>
> **학습 목표**: Frontend (React 19, TypeScript, Vite) & AI Server (Python, FastAPI, OpenAI API)
>
> 작성 원칙: 30년차 시니어 개발자가 주니어에게 지식을 전수하는 관점으로, "왜 이렇게 동작하는지" 원리를 설명

---

## 📚 Concepts

<!-- 새 개념은 이 주석 바로 아래에 추가 (최신순) -->

*아직 기록된 개념이 없습니다. `/learning concept` 명령으로 새 개념을 추가하세요.*

---

## 🔧 Troubleshooting

<!-- 새 트러블슈팅은 이 주석 바로 아래에 추가 (최신순) -->

### [2026-02-02] JWT 토큰 만료 시 403 반환으로 인한 자동 갱신 실패

#### 🚨 Symptom (증상)

```
- 로그인 후 30분(토큰 만료 시간) 경과 후 페이지 이동 시 "화면을 불러오지 못했습니다" 에러 표시
- 브라우저 새로고침(F5) 하면 정상 작동
- 네트워크 탭에서 403 Forbidden 에러 확인
```

**발생 조건**: accessToken 만료 후 인증이 필요한 API 호출 시

#### 🔍 Investigation (디버깅 과정)

**가설 1**: 프론트엔드 axios 인터셉터가 제대로 동작하지 않는다
- 확인: `api.ts`의 응답 인터셉터 코드 검토
- 결과: 인터셉터는 **401 에러만** 처리하도록 구현됨
```typescript
// api.ts:71-74
if (error.response.status !== 401) {
  return Promise.reject(error);  // 401이 아니면 그냥 에러 반환
}
```

**가설 2**: 백엔드가 401이 아닌 다른 에러를 반환한다
- 확인: 브라우저 네트워크 탭에서 응답 코드 확인
- 결과: **403 Forbidden** 반환 확인

**가설 3**: Spring Security 설정 문제
- 확인: `SecurityConfig.java` 검토
- 결과: `exceptionHandling` 설정 없음 → Spring Security 기본값 사용

#### 🎯 Root Cause (근본 원인)

**직접 원인**: 프론트엔드 인터셉터가 401만 처리하는데, 백엔드는 403을 반환

**근본 원인**: Spring Security의 `AuthenticationEntryPoint` 미설정

```java
// SecurityConfig.java - 현재 상태
.authorizeHttpRequests(auth -> auth
    .anyRequest().authenticated()
)
// exceptionHandling 설정 없음 → 기본값 403 반환
```

**배경 지식 - Spring Security 인증 실패 처리 흐름**:

```
1. 만료된 토큰으로 요청
      ↓
2. JwtAuthenticationFilter: validateToken() 실패
      ↓
3. SecurityContext에 인증 정보 설정 안 됨 (= 비인증 상태)
      ↓
4. .anyRequest().authenticated() 규칙에 걸림
      ↓
5. AuthenticationEntryPoint 호출
      ↓
6. 커스텀 설정 없음 → 기본값 403 Forbidden 반환
```

**HTTP 상태 코드 표준**:
| 코드 | 의미 | 사용 시점 |
|------|------|----------|
| 401 Unauthorized | 인증 실패 | 토큰 없음, 만료, 잘못됨 |
| 403 Forbidden | 권한 없음 | 인증됐지만 해당 리소스 접근 권한 없음 |

Spring Security는 별도 설정 없이는 인증 실패를 403으로 처리하는데, 이는 HTTP 표준과 맞지 않아 대부분의 REST API 프로젝트에서 커스터마이징한다.

#### ✅ Solution (해결책)

**방법 1: 백엔드에서 401 반환하도록 수정 (권장)**

```java
// SecurityConfig.java
import jakarta.servlet.http.HttpServletResponse;

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // ... 기존 설정 ...
        .authorizeHttpRequests(auth -> auth
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((request, response, authException) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Unauthorized\"}");
            })
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

**방법 2: 프론트엔드에서 403도 처리**

```typescript
// api.ts - 401 또는 403일 때 refresh 시도
if (error.response.status !== 401 && error.response.status !== 403) {
  return Promise.reject(error);
}
```

**권장**: 방법 1 (HTTP 표준 준수, 향후 권한 기반 기능 추가 시 401/403 구분 가능)

#### 📝 Lesson Learned (배운 점)

1. **Spring Security 기본값을 믿지 말 것**: REST API에서는 반드시 `AuthenticationEntryPoint`를 커스터마이징해서 401을 반환하도록 설정해야 한다.

2. **프론트-백엔드 에러 코드 계약**: 토큰 관련 에러 처리 시 프론트엔드와 백엔드가 어떤 HTTP 상태 코드를 사용할지 미리 합의해야 한다.

3. **디버깅 순서**: "안 된다"는 증상만 보지 말고, 네트워크 탭에서 실제 응답 코드부터 확인할 것. 401인지 403인지에 따라 문제 원인이 완전히 달라진다.

4. **새로고침하면 되는 이유**: App.tsx의 useEffect가 앱 마운트 시 refresh 호출 → 새 토큰 발급 → 이후 API 호출은 유효한 토큰 사용

---

## 📖 Quick Reference

### 자주 쓰는 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 실행 |
| `uvicorn app.main:app --reload` | FastAPI 개발 서버 실행 |

### 자주 마주치는 에러

| 에러 | 원인 | 해결 |
|------|------|------|
| 토큰 만료 후 403 | Spring Security 기본값 | `exceptionHandling`으로 401 반환 설정 |

---

## 📅 학습 일지

| 날짜 | 주제 | 링크 |
|------|------|------|
| 2026-02-02 | JWT 토큰 만료 시 403 에러 트러블슈팅 | [Troubleshooting](#2026-02-02-jwt-토큰-만료-시-403-반환으로-인한-자동-갱신-실패) |
| 2026-02-02 | Learning.md 초기화 | - |
