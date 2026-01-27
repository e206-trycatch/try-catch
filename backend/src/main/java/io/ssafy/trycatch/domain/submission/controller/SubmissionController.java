package io.ssafy.trycatch.domain.submission.controller;

import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.dto.response.SubmissionRespDto;
import io.ssafy.trycatch.domain.submission.service.SubmissionService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/api/v1/rooms/{roomId}/submission")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {
        Long userId = getCurrentUserId();
        // FRONTEND position인 경우
        if (request.getFrontend() != null && request.getBackend() == null) {
            // frontend만 처리
        }

        // BACKEND position인 경우
        if (request.getBackend() != null && request.getFrontend() == null) {
            // backend만 처리
        }

        // FULLSTACK position인 경우
        if (request.getFrontend() != null && request.getBackend() != null) {
            // frontend + backend 둘 다 처리
        }

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.submit(roomId, userId, request))
        );
    }

    @GetMapping("/api/v1/rooms/{roomId}/submission")
    public ResponseEntity<ApiRespDto<SubmissionRespDto>> submission(
            @PathVariable Long roomId) {
        Long userId = getCurrentUserId();

        return ResponseEntity.ok(
                ApiRespDto.success(submissionService.getSubmission(roomId, userId))
        );
    }

    // 인프라 배포 확인용
    @GetMapping("/api/v1/test/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("test success");
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }

}
