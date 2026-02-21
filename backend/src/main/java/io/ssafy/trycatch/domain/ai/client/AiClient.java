package io.ssafy.trycatch.domain.ai.client;

import io.ssafy.trycatch.domain.ai.dto.request.HintReqDto;
import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static io.ssafy.trycatch.global.exception.ErrorCode.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiClient {

    private final RestTemplate restTemplate;

    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    /**
     * AI 서버 헬스 체크
     * @return 헬스 체크 성공 여부
     */
    public boolean healthCheck() {
        try {
            String url = aiServerBaseUrl + "/api/v1/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            log.info("AI 서버 헬스 체크 성공");
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.error("AI 서버 헬스 체크 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 힌트 생성 요청
     * @param request 힌트 요청 정보
     * @return 힌트 응답
     */
    public HintRespDto generateHint(HintReqDto request) {
        String url = aiServerBaseUrl + "/api/v1/hint";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<HintReqDto> entity = new HttpEntity<>(request, headers);

//            log.info("AI 서버 힌트 요청 - userId: {}, problemId: {}, framework: {}",
//                    request.getUserId(), request.getProblemId(), request.getFramework());

            ResponseEntity<HintRespDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    HintRespDto.class
            );

            HintRespDto hintRespDto = response.getBody();

            if (hintRespDto != null) {
//                log.info("AI 서버 힌트 응답 - success: {}, guardrailPassed: {}",
//                        hintRespDto.isSuccess(), hintRespDto.isGuardrailPassed());
            }

            return hintRespDto;

        } catch (HttpClientErrorException e) {
            log.error("AI 서버 클라이언트 에러 [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new CustomException(AI_SERVER_BAD_REQUEST);

        } catch (HttpServerErrorException e) {
            log.error("AI 서버 내부 에러 [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new CustomException(AI_SERVER_INTERNAL_ERROR);

        } catch (ResourceAccessException e) {
            log.error("AI 서버 연결 실패: {}", e.getMessage());

            if (e.getMessage() != null && e.getMessage().contains("timeout")) {
                throw new CustomException(AI_SERVER_TIMEOUT);
            }
            throw new CustomException(AI_SERVER_CONNECTION_FAILED);

        } catch (Exception e) {
            log.error("힌트 생성 중 예외 발생: {}", e.getMessage(), e);
            throw new CustomException(AI_SERVER_INTERNAL_ERROR);
        }
    }
}