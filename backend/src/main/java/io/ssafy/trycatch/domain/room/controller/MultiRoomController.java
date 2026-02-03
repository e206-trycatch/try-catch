package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.dto.request.MultiRoomCreateReqDto;
import io.ssafy.trycatch.domain.room.dto.request.MultiRoomJoinReqDto;
import io.ssafy.trycatch.domain.room.dto.response.*;
import io.ssafy.trycatch.domain.room.service.MultiRoomService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms/multi")
@RequiredArgsConstructor
public class MultiRoomController {

    private final MultiRoomService multiRoomService;

    @GetMapping
    public ResponseEntity<ApiRespDto<MultiRoomSettingRespDto>> getMultiRoomSettings(
            @RequestParam Long themeId) {

        MultiRoomSettingRespDto response = multiRoomService.getMultiRoomSettings(themeId);

        return ResponseEntity.ok(
                ApiRespDto.success("멀티 플레이 설정 데이터를 불러왔습니다.", response)
        );
    }

    // 멀티 방 생성
    @PostMapping
    public ResponseEntity<ApiRespDto<MultiRoomCreateRespDto>> createMultiRoom(
            @AuthenticationPrincipal Long userId,
            @RequestBody MultiRoomCreateReqDto request) {

        MultiRoomCreateRespDto response = multiRoomService.createMultiRoom(userId, request);

        return ResponseEntity.ok(
                ApiRespDto.success("멀티 방이 생성되었습니다.", response)
        );
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveMultiRoom(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long roomId) {
        multiRoomService.leaveMultiRoom(userId, roomId);
        return ResponseEntity.ok(
                ApiRespDto.success("방을 나가셨습니다.", null)
        );
    }

    // 초대 코드로 방 참가
    @PostMapping("/join")
    public ResponseEntity<ApiRespDto<MultiRoomJoinRespDto>> joinMultiRoom(
            @AuthenticationPrincipal Long userId,
            @RequestBody MultiRoomJoinReqDto request) {
        MultiRoomJoinRespDto response = multiRoomService.joinMultiRoom(userId, request);
        return ResponseEntity.ok(
                ApiRespDto.success("방에 입장했습니다.", response)
        );
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiRespDto<MultiRoomInfoRespDto>> getMultiRoomInfo(
            @PathVariable Long roomId) {
        MultiRoomInfoRespDto response = multiRoomService.getMultiRoomInfo(roomId);
        return ResponseEntity.ok(
                ApiRespDto.success("대기방 정보를 불러왔습니다.", response)
        );
    }

    @GetMapping("/{roomId}/story/{questId}")
    public ResponseEntity<ApiRespDto<List<QuestStoryRespDto>>> getQuestStory(
            @PathVariable Long roomId,
            @PathVariable Long questId) {
        List<QuestStoryRespDto> response = multiRoomService.getQuestStory(roomId, questId);
        return ResponseEntity.ok(
                ApiRespDto.success("퀘스트 스토리를 불러왔습니다.", response)
        );
    }

    @GetMapping("/{roomId}/quest/{questId}")
    public ResponseEntity<ApiRespDto<MultiQuestDetailRespDto>> getQuestDetail(
            @PathVariable Long roomId,
            @PathVariable Long questId) {
        MultiQuestDetailRespDto response = multiRoomService.getQuestDetail(roomId, questId);
        return ResponseEntity.ok(
                ApiRespDto.success("퀘스트 상세 정보를 불러왔습니다.", response)
        );
    }
}