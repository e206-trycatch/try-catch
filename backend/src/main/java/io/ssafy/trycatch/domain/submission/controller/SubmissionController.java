package io.ssafy.trycatch.domain.submission.controller;

import io.ssafy.trycatch.domain.submission.dto.request.SubmissionReqDto;
import io.ssafy.trycatch.domain.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/api/v1/rooms/{roomId}/submission")
    public ResponseEntity<?> submission(
            @PathVariable Long roomId,
            @RequestBody SubmissionReqDto request) {

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

        Long userId = 1L; // 임시
        return ResponseEntity.ok(submissionService.submit(roomId, userId, request));
    }

    // 인프라 배포 확인용
    @GetMapping("/api/v1/test/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("test success");
    }

}
