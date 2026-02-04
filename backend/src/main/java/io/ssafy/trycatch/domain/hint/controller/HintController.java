package io.ssafy.trycatch.domain.hint.controller;


import io.ssafy.trycatch.domain.ai.dto.response.HintRespDto;
import io.ssafy.trycatch.domain.hint.dto.request.HintCreateReqDto;
import io.ssafy.trycatch.domain.hint.dto.response.HintHistoryRespDto;
import io.ssafy.trycatch.domain.hint.service.HintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;

    /**
     * 힌트 생성 요청 (AI 서버 호출 + Redis 저장)
     *
     * @param requestDto 힌트 요청 정보
     * @return 힌트 응답
     */
    @PostMapping("/hints")
    public ResponseEntity<HintRespDto> createHint(
            @RequestBody HintCreateReqDto requestDto,
            @AuthenticationPrincipal Long userId) {
        log.info("힌트 생성 요청 - roomId: {}, userId: {}, problemId: {}, question: {}",
                requestDto.getRoomId(), userId, requestDto.getProblemFrameworkId(), requestDto.getUserQuestion());

        HintRespDto response = hintService.requestHint(
                requestDto.getRoomId(),
                userId,
                requestDto.getProblemFrameworkId(),
                requestDto.getFramework(),
                requestDto.getUserQuestion(),
                requestDto.getSubmission()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 방의 힌트 이력 조회 (새로고침용)
     *
     * @param roomId 방 ID
     * @return 힌트 이력 목록
     */
    @GetMapping("/hints/rooms/{roomId}")
    public ResponseEntity<List<HintHistoryRespDto>> getHintHistory(
            @PathVariable Long roomId,
            @AuthenticationPrincipal Long userId) {
        log.info("힌트 이력 조회 - roomId: {}", roomId);

        List<HintHistoryRespDto> history = hintService.getHintHistory(roomId);

        return ResponseEntity.ok(history);
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




