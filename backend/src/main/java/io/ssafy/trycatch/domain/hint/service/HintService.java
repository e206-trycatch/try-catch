package io.ssafy.trycatch.domain.hint.service;

import io.ssafy.trycatch.domain.ai.client.AiClient;
import io.ssafy.trycatch.domain.ai.dto.request.HintReqDto;
import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.domain.hint.entity.HintChatMessage;
import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import io.ssafy.trycatch.global.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static io.ssafy.trycatch.global.exception.ErrorCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class HintService {

    private final AiClient aiClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ProblemFileRepository problemFileRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    private static final long CHAT_TTL_HOURS = 24;
    private static final long HINT_TTL_HOURS = 24;  // 24시간 TTL
    private static final long CODE_TTL_MINUTES = 5;
    private static final long HINT_COOLDOWN_SECONDS = 10;

    /**
     * 힌트 요청 및 Redis 저장
     */
    @Transactional
    public HintRespDto requestHint(Long roomId, Long userId, Long problemFrameworkId,
                                   String framework,
                                   String userQuestion, SubmissionReqDto submission) {


        // 1. 방 조회 및 힌트 개수 확인
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        if (room.getRemainingHintCount() <= 0) {
            log.warn("힌트 개수 부족 - roomId: {}, remaining: {}", roomId, room.getRemainingHintCount());

            HintRespDto noHintResponse = HintRespDto.builder()
                    .success(false)
                    .hint(null)
                    .guardrailPassed(false)
                    .rejectionReason("남은 힌트 개수가 없습니다.")
                    .build();

            LocalDateTime now = LocalDateTime.now();
            saveResponse(roomId, userId, noHintResponse, now);

            return noHintResponse;
        }


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

            // 2. 힌트 개수 차감 (트랜잭션 내에서)
            room.useHint();
            roomRepository.save(room);

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

    private HintChatMessage convertToHintChatMessage(LinkedHashMap<?, ?> map) {
        return HintChatMessage.builder()
                .type((String) map.get("type"))
                .roomId(Long.valueOf(map.get("roomId").toString()))
                .userId(Long.valueOf(map.get("userId").toString()))
                .content((String) map.get("content"))
                .success((Boolean) map.get("success"))
                .guardrailPassed((Boolean) map.get("guardrailPassed"))
                .rejectionReason((String) map.get("rejectionReason"))
                .timestamp(LocalDateTime.parse(map.get("timestamp").toString()))
                .build();
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
     * 방 조회 및 힌트 사용 가능 여부 검증 (쿨다운 포함)
     */
    public Room validateAndGetRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        // 1. 힌트 개수 체크
        if (room.getRemainingHintCount() <= 0) {
            log.warn("힌트 개수 부족 - roomId: {}, remaining: {}",
                    roomId, room.getRemainingHintCount());
            throw new CustomException(NO_HINTS_REMAINING);
        }

        // 2. 게임 시작 여부 및 쿨다운 체크
        if (room.getStartedAt() != null) {
            long elapsedSeconds = Duration.between(room.getStartedAt(), LocalDateTime.now()).getSeconds();

            if (elapsedSeconds < HINT_COOLDOWN_SECONDS) {
                long remainingCooldown = HINT_COOLDOWN_SECONDS - elapsedSeconds;
                log.warn("힌트 쿨다운 중 - roomId: {}, 경과 시간: {}초, 남은 시간: {}초",
                        roomId, elapsedSeconds, remainingCooldown);
                throw new CustomException(HINT_COOLDOWN_ACTIVE);
            }
        }

        return room;
    }

    /**
     * 남은 힌트 개수 조회
     */
    public int getRemainingHintCount(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException(ROOM_NOT_FOUND));

        return room.getRemainingHintCount();
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
     * 특정 방의 힌트 채팅 이력 조회 (WebSocket 형식으로 포맷팅)
     */
    public List<Map<String, Object>> getFormattedChatHistory(Long roomId) {
        try {
            String pattern = String.format("hint-chat:%d:*", roomId);
            Set<String> keys = redisTemplate.keys(pattern);

            if (keys == null || keys.isEmpty()) {
                return new ArrayList<>();
            }

            List<HintChatMessage> messages = keys.stream()
                    .map(key -> redisTemplate.opsForValue().get(key))
                    .filter(obj -> obj instanceof LinkedHashMap)
                    .map(obj -> convertToHintChatMessage((LinkedHashMap<?, ?>) obj))
                    .sorted(Comparator.comparing(HintChatMessage::getTimestamp))
                    .toList();

            // 1. 모든 userId 추출
            Set<Long> userIds = messages.stream()
                    .map(HintChatMessage::getUserId)
                    .collect(Collectors.toSet());

            // 2. 사용자 정보 배치 조회
            Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(User::getId, user -> user));

            // 3. 메시지 포맷팅
            return messages.stream()
                    .map(message -> formatChatMessage(message, userMap))
                    .toList();

        } catch (Exception e) {
            log.error("채팅 이력 조회 실패 - roomId: {}", roomId, e);
            return new ArrayList<>();
        }
    }

    /**
     * HintChatMessage를 WebSocket 응답 형식으로 변환 (사용자 정보 포함)
     */
    private Map<String, Object> formatChatMessage(HintChatMessage message, Map<Long, User> userMap) {
        User user = userMap.get(message.getUserId());
        String nickname = user != null ? user.getNickname() : "Unknown";
        String profileUrl = user != null && user.getProfileUrl() != null ? user.getProfileUrl() : "";

        if ("QUESTION".equals(message.getType())) {
            return Map.of(
                    "type", "HINT_QUESTION",
                    "data", Map.of(
                            "userId", message.getUserId(),
                            "nickname", nickname,
                            "profileUrl", profileUrl,
                            "question", message.getContent() != null ? message.getContent() : "",
                            "timestamp", message.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    ),
                    "timestamp", message.getTimestamp().toString()
            );
        } else {
            return Map.of(
                    "type", "HINT_MESSAGE",
                    "data", Map.of(
                            "userId", message.getUserId(),
                            "success", message.getSuccess() != null ? message.getSuccess() : false,
                            "hint", message.getContent() != null ? message.getContent() : "",
                            "guardrailPassed", message.getGuardrailPassed() != null ? message.getGuardrailPassed() : false,
                            "rejectionReason", message.getRejectionReason() != null ? message.getRejectionReason() : "",
                            "timestamp", message.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    ),
                    "timestamp", message.getTimestamp().toString()
            );
        }
    }

    /**
     * AI 서버 상태 확인
     */
    public boolean checkAiServerHealth() {
        return aiClient.healthCheck();
    }


}