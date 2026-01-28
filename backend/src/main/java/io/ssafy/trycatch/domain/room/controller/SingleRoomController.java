package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.dto.request.SingleRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.response.*;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.domain.room.service.SingleRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class SingleRoomController {

    private final SingleRoomService singleRoomService;

    @GetMapping("/single")
    public ResponseEntity<ApiRespDto<SingleRoomSettingRespDto>> getSingleRoomSettings(
            @RequestParam Long themeId) {

        SingleRoomSettingRespDto response = singleRoomService.getSingleRoomSettings(themeId);

        return ResponseEntity.ok(
                ApiRespDto.success("싱글 플레이 설정 데이터를 불러왔습니다.", response)
        );
    }

    // 싱글 방 생성
    @PostMapping("/single")
    public ResponseEntity<ApiRespDto<SingleRoomCreateRespDto>> createSingleRoom(
            @AuthenticationPrincipal Long userId,
            @RequestBody SingleRoomCreateReqDto request) {
        SingleRoomCreateRespDto response = singleRoomService.createSingleRoom(userId, request);
        return ResponseEntity.ok(
                ApiRespDto.success("싱글 방이 생성되었습니다.", response));
    }

    // 퀘스트 상세 조회
    @GetMapping("/single/quest")
    public ResponseEntity<ApiRespDto<List<QuestDetailRespDto>>> getQuestList(
            @RequestParam Long themeId) {

        List<QuestDetailRespDto> response = singleRoomService.getQuestList(themeId);

        return ResponseEntity.ok(
                ApiRespDto.success("퀘스트 목록을 불러왔습니다.", response)
        );
    }

    // 퀘스트 스토리 목록 조회
    @GetMapping("/single/quest/{questId}/story")
    public ResponseEntity<ApiRespDto<List<QuestStoryRespDto>>> getQuestStoryList(
            @PathVariable Long questId) {

        List<QuestStoryRespDto> response = singleRoomService.getQuestStoryList(questId);
        return ResponseEntity.ok(
                ApiRespDto.success("퀘스트 스토리를 불러왔습니다.", response)
        );
    }

    @GetMapping("/{roomId}/quest/{questId}/files")
    public ResponseEntity<ApiRespDto<ProblemFilesRespDto>> getProblemFiles(
            @PathVariable Long roomId,
            @PathVariable Long questId) {

        ProblemFilesRespDto response = singleRoomService.getProblemFiles(roomId, questId);

        return ResponseEntity.ok(
                ApiRespDto.success("문제 파일 목록을 불러왔습니다.", response)
        );
    }
}