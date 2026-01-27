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

    public ScoreResult scoreSubmission(String problemDoc, String submittedSource, String rubric, Room room) {
        try {
            String prompt = buildPrompt(problemDoc, submittedSource, rubric);
            GptRespDto response = callGptApi(prompt);
            return parseScoreResult(response, room);
        } catch (Exception e) {
            log.error("GPT 채점 중 오류 발생", e);
            return ScoreResult.builder()
                    .success(false)
                    .score(0)
                    .errorLog("채점 시스템 오류: " + e.getMessage())
                    .executionTime(calculateExecutionTime(room))
                    .build();
        }
    }

    private long calculateExecutionTime(Room room) {
        if (room == null || room.getStartedAt() == null) {
            return 0L;
        }
        Duration duration = Duration.between(room.getStartedAt(), LocalDateTime.now());
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        long millis = duration.toMillis();

        log.info("소요 시간: {}시간 {}분 {}초 (총 {}ms)", hours, minutes, seconds, millis);

        return millis;
    }

    private String buildPrompt(String problemDoc, String submittedSource, String rubric) {
        String safeProblemDoc = (problemDoc == null || problemDoc.isBlank())
                ? "문제 설명이 제공되지 않았습니다."
                : problemDoc;

        String safeRubric = (rubric == null || rubric.isBlank())
                ? """
               - 요구사항(문제 설명) 충족 여부
               - REST API 설계(경로/메서드/응답 형태) 타당성
               - 명백한 컴파일 오류 가능성 여부
               """
                : rubric;

        String safeSource = (submittedSource == null) ? "" : submittedSource;

        return String.format("""
            너는 "정적 코드 채점기"다. 코드를 실행/컴파일하지 않는다.
            아래 [문제 설명]과 [채점 기준]을 기준으로 [제출 코드]를 평가하라.
            하지만 컴파일러처럼, 텍스트만으로도 명백히 판단 가능한 컴파일 오류를 반드시 찾아야 한다.
            문제를 설명을 보고 문제대로 채점을 진행해라.
            
            절대 규칙(매우 중요):
            - 너는 추정/선의 해석을 하면 안 된다. 코드에 근거가 없으면 FAIL이다.
            - 아래 "정적 검증 절차"를 반드시 수행하고, 수행 결과를 바탕으로만 PASS/FAIL을 결정하라.
            - 응답은 JSON만 출력하라. 다른 텍스트 금지.
            
            정적 검증 절차:
            
            1) 엔드포인트 검증
            - 검증 스펙의 endpoint.method / endpoint.path와
              컨트롤러의 최종 매핑 결과를 비교한다.
            - 하나라도 불일치하면 FAIL.
            
            2) 응답 JSON 직렬화 검증
            - 검증 스펙의 responseType 클래스에 대해
              requiredGetters 목록의 모든 public getter 존재 여부를 확인한다.
            - 하나라도 없으면 FAIL.
            
            3) 호출-정의 매칭
            - 제출 코드에서 requiredSetters에 포함된 메서드 호출을 찾는다.
            - 호출된 메서드가 responseType 클래스에 정의되어 있지 않으면
              컴파일 오류로 간주하고 FAIL.
            
            4) 예시 응답 값 검증
            - expectedResponse에 정의된 값이
              코드 상에서 명시적으로 세팅되지 않으면 FAIL.
            
            
            판정:
            - 위 절차 1~4 중 하나라도 FAIL이면 success=false, score=0.
            - 모두 PASS이면 success=true, score는 1~100 정수.
            - success=true인 경우 errorLog는 반드시 ""(빈 문자열).
            - errorLog는 컴파일 했을 때, 실제 에러 로그에 뜨는 것을 간략하게 다듬어서 보여준다. 예시 결과처럼 안 뜬 경우에는 예시 결과와 일치하지 않는다고 알려준다. 어느 부분이 틀렸는지 알려주지 않고 답도 알려주지 않는다.
            어느 부분이 응답 결과와 다른지도 알려주지 않는다.
            
            출력 JSON 스키마(키는 정확히 이 3개만):
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
            """, safeProblemDoc, safeRubric, safeSource);
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

    private ScoreResult parseScoreResult(GptRespDto response, Room room) {
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

            // 정책 3: success=true인데 score가 0 이하이면 FAIL로 강등 + 0점
            if (success && score <= 0) {
//                success = false;
                score = 1;
            }

            // 정책 4: score 범위 보정 (혹시 모를 이상치 방지)
            if (score < 0) score = 0;
            if (score > 100) score = 100;

            long execTime = calculateExecutionTime(room);

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