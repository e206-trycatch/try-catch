package io.ssafy.trycatch.domain.game.controller;

import io.ssafy.trycatch.domain.game.dto.request.CodeSaveReqDto;
import io.ssafy.trycatch.domain.game.dto.response.MultiProblemFileListRespDto;
import io.ssafy.trycatch.domain.game.dto.response.PartnerCodeRespDto;
import io.ssafy.trycatch.domain.game.service.MultiGameService;
import io.ssafy.trycatch.domain.user.entity.User;
import io.ssafy.trycatch.global.common.ApiRespDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    // 멀티 코드 임시 저장
    @PostMapping("/{roomId}/save")
    public ResponseEntity<ApiRespDto<Void>> saveCode(
            @PathVariable Long roomId,
            @RequestBody @Valid CodeSaveReqDto request,
            @AuthenticationPrincipal Long userId) {
        log.info("코드 임시저장 요청: {}", request);
        multiGameService.saveCode(roomId, userId, request);

        return ResponseEntity.ok(
                ApiRespDto.success("코드 임시 저장 성공", null));
    }


    // 상대방 코드 조회
    @GetMapping("/{roomId}/{problemFrameworkId}/partner-code")
    public ResponseEntity<ApiRespDto<PartnerCodeRespDto>> getPartnerCode(
            @PathVariable Long roomId,
            @PathVariable Long problemFrameworkId,
            @AuthenticationPrincipal Long userId
    ) {
        PartnerCodeRespDto response = multiGameService.getPartnerCode(roomId, problemFrameworkId, userId);

        return ResponseEntity.ok(
                ApiRespDto.success("코드 저장 로그에서 상대방 코드를 로드합니다.",response));
    }
}
