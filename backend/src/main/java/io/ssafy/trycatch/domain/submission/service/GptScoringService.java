package io.ssafy.trycatch.domain.submission.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.trycatch.domain.submission.dto.request.GptReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.GptRespDto;
import io.ssafy.trycatch.domain.submission.dto.response.ScoreResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    public ScoreResult scoreSubmission(String problemDoc, String submittedSource, String rubric) {
        try {
            String prompt = buildPrompt(problemDoc, submittedSource, rubric);
            GptRespDto response = callGptApi(prompt);
            return parseScoreResult(response);
        } catch (Exception e) {
            log.error("GPT 채점 중 오류 발생", e);
            return ScoreResult.builder()
                    .success(false)
                    .score(0)
                    .errorLog("채점 시스템 오류: " + e.getMessage())
                    .executionTime(0L)
                    .build();
        }
    }

    private String buildPrompt(String problemDoc, String submittedSource, String rubric) {
        String safeProblemDoc = (problemDoc == null || problemDoc.isBlank())
                ? "문제 설명이 제공되지 않았습니다. 제출 코드의 요구사항 충족 여부와 일반적인 품질을 평가하세요."
                : problemDoc;

        String safeRubric = (rubric == null || rubric.isBlank())
                ? """
                   - 요구사항 충족 여부
                   - 명백한 오류/예외 가능성
                   - 코드 구조/가독성
                   """
                : rubric;

        String safeSource = (submittedSource == null) ? "" : submittedSource;

        return String.format("""
                너는 자동 채점기다.
                아래 [문제 설명]과 [채점 기준]을 기준으로 [제출 코드]를 평가하라.
                응답은 반드시 JSON만 출력하라. 다른 텍스트(설명/마크다운/코드블록)는 절대 포함하지 마라.

                [문제 설명]
                %s

                [채점 기준]
                %s

                [제출 코드]
                %s

                출력 JSON 스키마(정확히 이 키만 포함):
                {
                  "success": true,
                  "score": 85,
                  "errorLog": ""
                }
                
                - success: 문제 요구사항을 충족하면 true, 아니면 false
                - score: 0-100 사이의 정수
                - errorLog: 오류가 있으면 설명, 없으면 빈 문자열. 답을 설명하지는 않는다.
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
                                "Answer in Korean. You are a code grading system. Always respond with valid JSON only."),
                        new GptReqDto.Message("user", prompt)
                ))
                .temperature(0.2)
                .responseFormat(GptReqDto.ResponseFormat.builder()
                        .type("json_object")
                        .build())
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

    private ScoreResult parseScoreResult(GptRespDto response) {
        String content = null;
        try {
            content = response.getChoices().get(0).getMessage().getContent();

            // JSON 모드 사용 시 응답이 바로 JSON이므로 추출 불필요
            ScoreResult result = objectMapper.readValue(content, ScoreResult.class);

            // executionTime이 null이면 0으로 설정
            if (result.getExecutionTime() == null) {
                result = ScoreResult.builder()
                        .success(result.getSuccess())
                        .score(result.getScore())
                        .errorLog(result.getErrorLog())
                        .executionTime(0L)
                        .build();
            }

            return result;
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