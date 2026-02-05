package io.ssafy.trycatch.domain.submission.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.submission.dto.request.GptReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.GptRespDto;
import io.ssafy.trycatch.domain.submission.dto.response.ScoreResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GptScoringService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gpt.api.url}")
    private String gptApiUrl;

    @Value("${gpt.api.key}")
    private String gptApiKey;

    @Value("${gpt.api.model}")
    private String gptModel;

    /**
     * 코드 품질 검증 (개별 채점)
     */
    public ScoreResult scoreQuality(
            String problemDoc,
            String submittedSource,
            String rubric,
            String roleName,
            String expectedFramework,
            String expectedLanguage,
            Room room,
            LocalDateTime submittedAt) {
        try {
            String prompt = buildQualityPrompt(
                    problemDoc,
                    submittedSource,
                    rubric,
                    roleName,
                    expectedFramework,
                    expectedLanguage
            );
            GptRespDto response = callGptApi(prompt);
            return parseScoreResult(response, room, submittedAt);
        } catch (Exception e) {
            log.error("GPT 품질 채점 중 오류 발생", e);
            return ScoreResult.builder()
                    .success(false)
                    .score(0)
                    .errorLog("채점 시스템 오류: " + e.getMessage())
                    .executionTime(calculateExecutionTime(room, submittedAt))
                    .build();
        }
    }

    private long calculateExecutionTime(Room room, LocalDateTime submittedAt) {
        if (room == null || room.getStartedAt() == null) {
            return 0L;
        }
        Duration duration = Duration.between(room.getStartedAt(), submittedAt);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        long millis = duration.toMillis();

        log.info("소요 시간: {}시간 {}분 {}초 (총 {}ms)", hours, minutes, seconds, millis);

        return millis;
    }

    /**
     * 품질 검증 프롬프트
     */
    private String buildQualityPrompt(
            String problemDoc,
            String submittedSource,
            String rubric,
            String roleName,
            String expectedFramework,
            String expectedLanguage
    ) {
        String safeProblemDoc = (problemDoc == null || problemDoc.isBlank())
                ? "문제 설명이 제공되지 않았습니다."
                : problemDoc;
        String preview = safeProblemDoc.length() > 100
                ? safeProblemDoc.substring(0, 100) + "..."
                : safeProblemDoc;
        log.info("문제 설명 (미리보기): {}", preview);

        String safeRubric = (rubric == null || rubric.isBlank())
                ? """
                - 요구사항(문제 설명) 충족 여부
                - REST API 설계(경로/메서드/응답 형태) 타당성
                - 명백한 컴파일 오류 가능성 여부
                """
                : rubric;

        String safeSource = (submittedSource == null) ? "" : submittedSource;

        String roleValidation = roleName.equals("FRONTEND")
                ? String.format("""
                **코드 역할 및 프레임워크 검증:**
                이 문제는 Frontend 코드를 요구하며, 반드시 %s (%s)로 작성되어야 한다.
                
                1. Backend 코드 패턴이 있는지 확인:
                   - @RestController, @Service, @Repository, @Entity
                   - Spring/Django/Express 등 Backend 프레임워크
                   → 발견 시 즉시 FAIL: "Frontend 코드를 제출해야 합니다."
                
                2. 올바른 Frontend 프레임워크인지 확인:
                   - 요구: %s
                   → 다른 프레임워크 발견 시 FAIL: "%s 프레임워크를 사용해야 합니다."
                
                3. 기능 구현 검증:
                   - 문제에서 요구한 UI 요소가 구현되었는가?
                   - 상태 관리가 적절한가?
                   - 이벤트 핸들러가 제대로 연결되었는가?
                   - API 호출 코드가 있는가? (경로는 검증하지 않음)
                   - 불필요한 재렌더링이 발생하지 않도록 의존성 배열이 정확히 설정되어 있는가?
                """, expectedFramework, expectedLanguage, expectedFramework, expectedFramework)
                : String.format("""
                **코드 역할 및 프레임워크 검증:**
                이 문제는 Backend 코드를 요구하며, 반드시 %s (%s)로 작성되어야 한다.
                
                1. Frontend 코드 패턴이 있는지 확인:
                   - Vue 컴포넌트 (<template>, <script>)
                   - React 컴포넌트 (useState, useEffect, JSX)
                   → 발견 시 즉시 FAIL: "Backend 코드를 제출해야 합니다."
                
                2. 올바른 Backend 프레임워크인지 확인:
                   - 요구: %s
                   → 다른 프레임워크 발견 시 FAIL: "%s 프레임워크를 사용해야 합니다."
                
                3. 기능 구현 검증:
                   - 문제에서 요구한 비즈니스 로직이 구현되었는가?
                   - DB 조회/저장 로직이 있는가?
                   - 예외 처리가 적절한가?
                   - API 엔드포인트가 정의되어 있는가? (경로 일치는 검증하지 않음)
                """, expectedFramework, expectedLanguage, expectedFramework, expectedFramework);

        return String.format("""
                너는 "코드 품질 검증기"다.
                
                %s
                
                절대 규칙:
                - 코드에 근거가 없으면 FAIL
                - 응답은 JSON만 출력
                - API 경로나 Method 일치 여부는 검증하지 않는다 (다음 단계에서 검증됨)
                
                판정:
                - 위 검증 중 하나라도 FAIL이면 success=false, score=0이다. 이 경우 코드 품질 평가는 수행하지 않는다.
                - 모두 PASS이면 success=true, score는 1~100 정수
                - 새 파일을 만들 수 있다는 가정에서의 베스트 프랙티스를 기준으로 채점하지 말고,
                  주어진 파일 내 수정만으로 가능한 최선을 100점 기준으로 채점하라.
                - success=true인 경우 errorLog는 ""(빈 문자열)
                - errorLog는 컴파일 했을 때, 실제 에러 로그에 뜨는 것을 간략하게 다듬어서 보여준다. 예시 결과처럼 안 뜬 경우에는 예시 결과와 일치하지 않는다고 알려준다. 어느 부분이 틀렸는지 알려주지 않고 답도 알려주지 않는다.
                  어느 부분이 응답 결과와 다른지도 알려주지 않는다.
                
                출력 JSON:
                {
                  "success": false,
                  "score": 0,
                  "errorLog": "Method 'POST' is not supported. 응답 결과가 예시 응답 결과와 일치하지 않습니다."
                }
                
                [문제 설명]
                %s
                
                [채점 기준]
                %s
                
                [제출 코드]
                %s
                """, roleValidation, safeProblemDoc, safeRubric, safeSource);
    }

    /**
     * Fullstack 통합 채점
     */
    public ScoreResult scoreFullstackIntegrated(
            String problemDoc,
            String frontendCode,
            String backendCode,
            String frontendFramework,
            String frontendLanguage,
            String backendFramework,
            String backendLanguage,
            Room room,
            LocalDateTime submittedAt) {
        try {
            String prompt = buildFullstackIntegratedPrompt(
                    problemDoc,
                    frontendCode,
                    backendCode,
                    frontendFramework,
                    frontendLanguage,
                    backendFramework,
                    backendLanguage
            );
            GptRespDto response = callGptApi(prompt);
            return parseScoreResult(response, room, submittedAt);
        } catch (Exception e) {
            log.error("GPT Fullstack 통합 채점 중 오류 발생", e);
            return ScoreResult.builder()
                    .success(false)
                    .score(0)
                    .errorLog("채점 시스템 오류: " + e.getMessage())
                    .executionTime(calculateExecutionTime(room, submittedAt))
                    .build();
        }
    }

    /**
     * Fullstack 통합 채점 프롬프트
     */
    private String buildFullstackIntegratedPrompt(
            String problemDoc,
            String frontendCode,
            String backendCode,
            String frontendFramework,
            String frontendLanguage,
            String backendFramework,
            String backendLanguage
    ) {
        String safeProblemDoc = (problemDoc == null || problemDoc.isBlank())
                ? "문제 설명이 제공되지 않았습니다."
                : problemDoc;

        return String.format("""
            너는 "Fullstack 코드 통합 검증기"다.
            
            **1단계: Frontend 코드 품질 검증**
            이 문제는 Frontend 코드를 요구하며, 반드시 %s (%s)로 작성되어야 한다.
            
            1-1. Backend 코드 패턴이 있는지 확인:
               - @RestController, @Service, @Repository, @Entity
               - Spring/Django/Express 등 Backend 프레임워크
               → 발견 시 즉시 FAIL: "Frontend 코드를 제출해야 합니다."
            
            1-2. 올바른 Frontend 프레임워크인지 확인:
               - 요구: %s
               → 다른 프레임워크 발견 시 FAIL: "%s 프레임워크를 사용해야 합니다."
            
            1-3. 기능 구현 검증:
               - 문제에서 요구한 UI 요소가 구현되었는가?
               - 상태 관리가 적절한가?
               - 이벤트 핸들러가 제대로 연결되었는가?
               - API 호출 코드가 있는가? (경로는 3단계에서 검증)
            
            **2단계: Backend 코드 품질 검증**
            이 문제는 Backend 코드를 요구하며, 반드시 %s (%s)로 작성되어야 한다.
            
            2-1. Frontend 코드 패턴이 있는지 확인:
               - Vue 컴포넌트 (<template>, <script>)
               - React 컴포넌트 (useState, useEffect, JSX)
               → 발견 시 즉시 FAIL: "Backend 코드를 제출해야 합니다."
            
            2-2. 올바른 Backend 프레임워크인지 확인:
               - 요구: %s
               → 다른 프레임워크 발견 시 FAIL: "%s 프레임워크를 사용해야 합니다."
            
            2-3. 기능 구현 검증:
               - 문제에서 요구한 비즈니스 로직이 구현되었는가?
               - DB 조회/저장 로직이 있는가?
               - 예외 처리가 적절한가?
               - API 엔드포인트가 정의되어 있는가? (경로 일치는 3단계에서 검증)
            
            **3단계: API 계약 검증 (1, 2단계 모두 PASS인 경우에만)**
            목표: Frontend와 Backend가 같은 API를 사용하고 있는가?
            
            3-1. API 경로 일치:
               - Frontend의 fetch/axios 경로
               - Backend의 @GetMapping/@PostMapping 경로
               → 동일 엔드포인트로 해석되는가?
            
            3-2. HTTP Method 일치:
               - Frontend의 method (GET, POST, PUT, DELETE)
               - Backend의 매핑 어노테이션
               → 일치하는가?
            
            3-3. Request Body 형식 일치 (POST/PUT인 경우):
               - Frontend가 보내는 JSON 필드
               - Backend DTO의 필드
               → 필드명이 일치하는가?
               Frontend가 JSON body를 명시적으로 보내는 경우에만 필드 일치 여부를 검증한다.
               (@RequestParam/@PathVariable로 받는 경우는 해당 방식에 맞게 비교한다.)
            
            3-4. Response 형식 기본 일치:
               - Backend 반환 타입의 필드
               - Frontend가 사용하는 필드
               → 주요 필드가 일치하는가?
               Response는 프론트가 실제로 접근하는 주요 필드 경로가 백 응답 구조에서 존재하는지 확인한다.
            
            절대 규칙:
            - 코드에 근거가 없으면 FAIL
            - 1, 2, 3단계 중 하나라도 FAIL이면 success=false, score=0
            - 모두 PASS이면 success=true, score=1~100
            - success=true인 경우 errorLog=""
            - 응답은 JSON만 출력
            
            판정:
            - 1단계 FAIL → success=false, score=0, errorLog: Frontend 검증 실패 사유
            - 2단계 FAIL → success=false, score=0, errorLog: Backend 검증 실패 사유
            - 3단계 FAIL → success=false, score=0, errorLog: API 계약 검증 실패 사유
            - 모두 PASS → success=true, score=1~100 (코드 품질에 따라)
            - 새 파일을 만들 수 있다는 가정에서의 베스트 프랙티스를 기준으로 채점하지 말고,
                  주어진 파일 내 수정만으로 가능한 최선을 100점 기준으로 채점하라.
            - errorLog는 간략하게 (어느 부분이 틀렸는지, 답은 알려주지 않음)
            
            FAIL 예시:
            - Frontend에 @RestController 발견 → "Frontend 코드를 제출해야 합니다."
            - Backend에 React 사용 → "%s 프레임워크를 사용해야 합니다."
            - API 경로 불일치 → "API 경로가 일치하지 않습니다."
            - HTTP Method 불일치 → "HTTP Method가 일치하지 않습니다."
            - Request Body 불일치 → "요청 데이터 형식이 일치하지 않습니다."
            - 응답 결과가 예시와 다름 → "응답 결과가 예시 응답 결과와 일치하지 않습니다."
            
            출력 JSON:
            {
              "success": false,
              "score": 0,
              "errorLog": "API 경로가 일치하지 않습니다."
            }
            
            [문제 설명]
            %s
            
            [Frontend 코드 (%s, %s)]
            %s
            
            [Backend 코드 (%s, %s)]
            %s
            """,
                // 1-3: Frontend 프레임워크 정보 (1단계)
                frontendFramework, frontendLanguage, frontendFramework, frontendFramework,
                // 4-7: Backend 프레임워크 정보 (2단계)
                backendFramework, backendLanguage, backendFramework, backendFramework,
                // 8: Backend 프레임워크 (FAIL 예시용)
                backendFramework,
                // 9: 문제 설명
                safeProblemDoc,
                // 10-11: Frontend 코드 헤더
                frontendFramework, frontendLanguage,
                // 12: Frontend 코드
                frontendCode,
                // 13-14: Backend 코드 헤더
                backendFramework, backendLanguage,
                // 15: Backend 코드
                backendCode
        );
    }

    private GptRespDto callGptApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(gptApiKey);

        GptReqDto request = GptReqDto.builder()
                .model(gptModel)
                .messages(List.of(
                        new GptReqDto.Message("developer",
                                "You are a code grading system. Respond with valid JSON only. Do not wrap in markdown."),
                        new GptReqDto.Message("user", prompt)
                ))
                .build();

        HttpEntity<GptReqDto> entity = new HttpEntity<>(request, headers);

        ResponseEntity<GptRespDto> response = restTemplate.exchange(
                gptApiUrl,
                HttpMethod.POST,
                entity,
                GptRespDto.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            throw new RuntimeException("GPT API 호출 실패");
        }

        return response.getBody();
    }

    private ScoreResult parseScoreResult(GptRespDto response, Room room, LocalDateTime submittedAt) {
        String content = null;
        try {
            content = response.getChoices().get(0).getMessage().getContent();

            // JSON만 추출해서 파싱
            String json = extractJsonObject(content);
            ScoreResult raw = objectMapper.readValue(json, ScoreResult.class);

            boolean success = Boolean.TRUE.equals(raw.getSuccess());
            String errorLog = raw.getErrorLog() == null ? "" : raw.getErrorLog().trim();

            int rawScore = raw.getScore() == null ? 0 : raw.getScore();

            // 정책 1: success=false일 때만 errorLog를 FAIL 사유로 사용
            if (success) {
                errorLog = "";
            }

            // 정책 2: FAIL이면 점수는 무조건 0
            int score = success ? rawScore : 0;

            // 정책 3: success=true인데 score가 0 이하이면 점수를 1로 보정
            if (success && score <= 0) {
                score = 1;
            }

            // 정책 4: score 범위 보정 (혹시 모를 이상치 방지)
            if (score < 0) score = 0;
            if (score > 100) score = 100;

            long execTime = calculateExecutionTime(room, submittedAt);

            return ScoreResult.builder()
                    .success(success)
                    .score(score)
                    .errorLog(errorLog)
                    .executionTime(execTime)
                    .build();

        } catch (Exception e) {
            log.error("GPT 응답 파싱 실패. content={}", content, e);
            throw new RuntimeException("채점 결과 파싱 실패", e);
        }
    }

    private String extractJsonObject(String content) {
        if (content == null) {
            throw new RuntimeException("GPT 응답이 비어있습니다.");
        }
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) {
            throw new RuntimeException("GPT 응답에 JSON 객체가 없습니다: " + content);
        }
        return content.substring(start, end + 1);
    }
}