package io.ssafy.trycatch.domain.game.controller;

import io.ssafy.trycatch.domain.game.dto.response.MultiProblemFileListRespDto;
import io.ssafy.trycatch.domain.game.service.MultiGameService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/rooms/multi")
@RequiredArgsConstructor
public class MultiGameController {

    private final MultiGameService multiGameService;

    // 멀티 문제 파일 조회
    @GetMapping("/{roomId}/quest/{questId}/files")
    public ResponseEntity<ApiRespDto<MultiProblemFileListRespDto>> getMultiProblemFiles(
            @PathVariable long roomId,
            @PathVariable Long questId,
            @AuthenticationPrincipal Long userId) {

        MultiProblemFileListRespDto response = multiGameService.getMultiProblemFiles(
                roomId, questId, userId);

        log.info("멀티 문제 파일 조회 요청");

        return ResponseEntity.ok(
                ApiRespDto.success("멀티 - 문제 파일을 불러오는 데 성공했습니다.", response)
        );
    }

}
