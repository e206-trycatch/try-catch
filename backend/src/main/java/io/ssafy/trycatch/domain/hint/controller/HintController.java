package io.ssafy.trycatch.domain.hint.controller;


import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.domain.hint.dto.HintChatMessage;
import io.ssafy.trycatch.domain.hint.dto.request.HintCreateReqDto;
import io.ssafy.trycatch.domain.hint.dto.response.HintHistoryRespDto;
import io.ssafy.trycatch.domain.hint.service.HintService;
import io.ssafy.trycatch.domain.room.entity.Room;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionStartRespDto;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.global.exception.CustomException;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static io.ssafy.trycatch.global.exception.ErrorCode.USER_NOT_FOUND;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @PostMapping("/rooms/{roomId}/hints")
    public ResponseEntity<ApiRespDto<Map<String, Object>>> createHint(
            @PathVariable Long roomId,
            @RequestBody HintCreateReqDto requestDto,
            @AuthenticationPrincipal Long userId) {

        log.info("힌트 생성 요청 - roomId: {}, userId: {}", roomId, userId);

        // 1. 방 조회 및 힌트 검증 (1번 쿼리)
        Room room = hintService.validateAndGetRoom(roomId);

        // 2. 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(USER_NOT_FOUND));

        // 3. 질문 저장 및 브로드캐스트
        hintService.saveQuestion(roomId, userId, requestDto.getUserQuestion());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(
                        SocketEventType.HINT_QUESTION,
                        Map.of(
                                "userId", userId,
                                "nickname", user.getNickname(),
                                "profileUrl", user.getProfileUrl() != null ? user.getProfileUrl() : "",
                                "question", requestDto.getUserQuestion(),
                                "remainingHintCount", room.getRemainingHintCount() - 1,  // 조회한 room 사용
                                "timestamp", System.currentTimeMillis()
                        )
                )
        );

        // 4. 비동기로 AI 힌트 생성
        CompletableFuture.runAsync(() -> {
            try {
                HintRespDto response = hintService.requestHint(
                        roomId, userId,
                        requestDto.getProblemFrameworkId(),
                        requestDto.getFramework(),
                        requestDto.getUserQuestion(),
                        requestDto.getSubmission()
                );

                // 차감 후 남은 개수 조회 (1번 더 쿼리 - 비동기라 어쩔 수 없음)
                int remainingHints = hintService.getRemainingHintCount(roomId);

                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomId + "/game",
                        SocketRespDto.of(
                                SocketEventType.HINT_MESSAGE,
                                Map.of(
                                        "userId", userId,
                                        "success", response.isSuccess(),
                                        "hint", response.getHint() != null ? response.getHint() : "",
                                        "guardrailPassed", response.isGuardrailPassed(),
                                        "rejectionReason", response.getRejectionReason() != null ? response.getRejectionReason() : "",
                                        "remainingHintCount", remainingHints,
                                        "timestamp", System.currentTimeMillis()
                                )
                        )
                );

            } catch (Exception e) {
                log.error("힌트 생성 실패", e);

                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomId + "/game",
                        SocketRespDto.of(
                                SocketEventType.HINT_ERROR,
                                Map.of(
                                        "userId", userId,
                                        "message", "힌트 생성에 실패했습니다.",
                                        "timestamp", System.currentTimeMillis()
                                )
                        )
                );
            }
        });

        return ResponseEntity.ok(ApiRespDto.success(
                Map.of(
                        "status", "accepted",
                        "message", "힌트 생성 중...",
                        "remainingHintCount", room.getRemainingHintCount() - 1
                )
        ));
    }

    /**
     * 힌트 채팅 이력 조회 (새로고침용)
     *
     * @param roomId 방 ID
     * @return 질문과 답변이 섞인 채팅 이력
     */
    @GetMapping("/rooms/{roomId}/hints")
    public ResponseEntity<ApiRespDto<List<Map<String, Object>>>> getHintHistory(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {
        log.info("힌트 이력 조회 - roomId: {}", roomId);

        List<Map<String, Object>> formattedHistory = hintService.getFormattedChatHistory(roomId);

        return ResponseEntity.ok(ApiRespDto.success(formattedHistory));
    }


    /**
     * AI 서버 헬스 체크
     *
     * @return 헬스 체크 결과
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        boolean isHealthy = hintService.checkAiServerHealth();

        return ResponseEntity.ok(Map.of(
                "aiServerHealthy", isHealthy,
                "status", isHealthy ? "UP" : "DOWN"
        ));
    }
}




