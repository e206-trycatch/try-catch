package io.ssafy.trycatch.domain.hint.service;

import io.ssafy.trycatch.domain.ai.client.AiClient;
import io.ssafy.trycatch.domain.ai.dto.request.HintReqDto;
import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.domain.hint.dto.HintChatMessage;
import io.ssafy.trycatch.domain.hint.dto.HintHistory;
import io.ssafy.trycatch.domain.hint.dto.response.HintHistoryRespDto;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HintService {

    private final AiClient aiClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ProblemFileRepository problemFileRepository;

    private static final long CHAT_TTL_HOURS = 24;
    private static final long HINT_TTL_HOURS = 24;  // 24시간 TTL
    private static final long CODE_TTL_MINUTES = 5;

    /**
     * 힌트 요청 및 Redis 저장
     */
    public HintRespDto requestHint(Long roomId, Long userId, Long problemFrameworkId,
                                   String framework,
                                   String userQuestion, SubmissionReqDto submission) {

        // 1. 사용자 제출 코드를 Redis에 임시 저장 (AI 서버가 조회할 수 있도록)
        saveUserCodeToRedis(userId, problemFrameworkId, submission);

        // 2. 문제 설명 조회
        String problemDescription = getProblemDoc(problemFrameworkId);

        // 1. AI 서버 요청 DTO 생성
        HintReqDto request = HintReqDto.builder()
                .userId(String.valueOf(userId))
                .problemId(String.valueOf(problemFrameworkId))
                .framework(framework)
                .problemDescription(problemDescription)
                .userQuestion(userQuestion)
                .build();

        HintRespDto response;
        LocalDateTime now = LocalDateTime.now();

        try {
            // 2. AI 서버 호출
            response = aiClient.generateHint(request);

            // 3. Redis에 힌트 저장
            saveResponse(roomId, userId, response, now);

            if (response.isSuccess()) {
                log.info("힌트 생성 및 저장 성공 - roomId: {}, userId: {}, problemId: {}",
                        roomId, userId, problemFrameworkId);
            } else {
                log.warn("힌트 생성 거절 - roomId: {}, userId: {}, reason: {}",
                        roomId, userId, response.getRejectionReason());
            }

            return response;

        } catch (CustomException e) {
            log.error("힌트 생성 실패 - roomId: {}, userId: {}, error: {}",
                    roomId, userId, e.getMessage());

            // 4. 실패 시 폴백 응답 생성 및 저장
            response = HintRespDto.builder()
                    .success(false)
                    .hint(null)
                    .guardrailPassed(false)
                    .rejectionReason("일시적으로 힌트를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.")
                    .build();

            saveResponse(roomId, userId, response, now);

            return response;
        }
    }

    /**
     * 응답을 Redis에 저장 (채팅 이력)
     */
    private void saveResponse(Long roomId, Long userId, HintRespDto response,
                              LocalDateTime timestamp) {
        try {
            HintChatMessage message = HintChatMessage.builder()
                    .type("RESPONSE")
                    .roomId(roomId)
                    .userId(userId)
                    .content(response.getHint())
                    .success(response.isSuccess())
                    .guardrailPassed(response.isGuardrailPassed())
                    .rejectionReason(response.getRejectionReason())
                    .timestamp(timestamp)
                    .build();

            String key = HintChatMessage.generateKey(roomId, timestamp);
            redisTemplate.opsForValue().set(key, message, CHAT_TTL_HOURS, TimeUnit.HOURS);

            log.debug("응답 저장 - key: {}", key);

        } catch (Exception e) {
            log.error("응답 저장 실패 - roomId: {}, userId: {}", roomId, userId, e);
        }
    }

    /**
     * 문제 설명(DOC 파일) 조회
     */
    private String getProblemDoc(Long problemFrameworkId) {
        List<ProblemFile> docFiles = problemFileRepository
                .findByProblemFrameworkIdAndFileTypeAndIsDeleted(
                        problemFrameworkId,
                        FileType.DOC,
                        TrueOrFalse.F
                );

        return docFiles.stream()
                .map(file -> String.format("## DOC: %s\n%s\n\n",
                        safe(file.getFilePath()),
                        safe(file.getCode())))
                .collect(Collectors.joining());
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    /**
     * 특정 방의 힌트 채팅 이력 조회 (새로고침용)
     */
    public List<HintChatMessage> getChatHistory(Long roomId) {
        try {
            String pattern = String.format("hint-chat:%d:*", roomId);
            Set<String> keys = redisTemplate.keys(pattern);

            if (keys == null || keys.isEmpty()) {
                return new ArrayList<>();
            }

            return keys.stream()
                    .map(key -> (HintChatMessage) redisTemplate.opsForValue().get(key))
                    .filter(message -> message != null)
                    .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("채팅 이력 조회 실패 - roomId: {}", roomId, e);
            return new ArrayList<>();
        }
    }

    /**
     * 사용자 제출 코드를 Redis에 임시 저장 (AI 서버 조회용)
     */
    private void saveUserCodeToRedis(Long userId, Long problemFrameworkId,
                                     SubmissionReqDto submission) {
        try {
            String key = String.format("user-code:%d:%d", userId, problemFrameworkId);

            // SubmissionReqDto를 JSON 형태로 Redis에 저장
            // (AI 서버가 조회 시 파일별로 구분된 코드를 받을 수 있음)
            redisTemplate.opsForValue().set(key, submission, CODE_TTL_MINUTES, TimeUnit.MINUTES);

//            log.debug("사용자 코드 Redis 저장 완료 - key: {}, files: {}",
//                    key, submission.getBackend().getFiles().size() + submission.getFrontend().getFiles().size());

        } catch (Exception e) {
            log.error("사용자 코드 Redis 저장 실패 - userId: {}, problemId: {}, error: {}",
                    userId, problemFrameworkId, e.getMessage());
            // 저장 실패해도 계속 진행 (AI 서버가 코드 없이도 힌트 생성 가능)
        }
    }

    /**
     * 질문을 Redis에 저장 (채팅 이력)
     */
    public void saveQuestion(Long roomId, Long userId, String question) {
        LocalDateTime now = LocalDateTime.now();

        HintChatMessage message = HintChatMessage.builder()
                .type("QUESTION")
                .roomId(roomId)
                .userId(userId)
                .content(question)
                .timestamp(now)
                .build();

        String key = HintChatMessage.generateKey(roomId, now);
        redisTemplate.opsForValue().set(key, message, CHAT_TTL_HOURS, TimeUnit.HOURS);

        log.debug("질문 저장 - key: {}", key);
    }


    /**
     * Redis에 힌트 저장 (RedisTemplate 사용)
     */
    private void saveHintToRedis(Long roomId, Long userId, Long problemFrameworkId,
                                 String framework, String userQuestion,
                                 HintRespDto response, LocalDateTime createdAt) {
        try {
            String key = HintHistory.generateKey(roomId, userId, createdAt);

            HintHistory history = HintHistory.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .problemFrameworkId(problemFrameworkId)
                    .framework(framework)
                    .userQuestion(userQuestion)
                    .hintContent(response.getHint())
                    .guardrailPassed(response.isGuardrailPassed())
                    .rejectionReason(response.getRejectionReason())
                    .createdAt(createdAt)
                    .build();

            List<HintChatMessage> messages = keys.stream()
                    .map(key -> redisTemplate.opsForValue().get(key))
                    .filter(obj -> obj instanceof LinkedHashMap)
                    .map(obj -> convertToHintChatMessage((LinkedHashMap<?, ?>) obj))
                    .sorted(Comparator.comparing(HintChatMessage::getTimestamp))
                    .toList();

//            log.debug("힌트 Redis 저장 완료 - key: {}", key);

        } catch (Exception e) {
            // Redis 저장 실패는 로그만 남기고 메인 플로우에 영향 없도록
            log.error("힌트 Redis 저장 실패 - roomId: {}, userId: {}, error: {}",
                    roomId, userId, e.getMessage());
        }
    }

    /**
     * AI 서버 상태 확인
     */
    public boolean checkAiServerHealth() {
        return aiClient.healthCheck();
    }
}