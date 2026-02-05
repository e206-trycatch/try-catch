package io.ssafy.trycatch.domain.game.controller;


import io.ssafy.trycatch.domain.game.dto.request.ChatMessageReqDto;
import io.ssafy.trycatch.domain.game.dto.response.ChatMessageRespDto;
import io.ssafy.trycatch.domain.game.service.ChatService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * 특정 게임방의 채팅 메시지 목록 조회
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiRespDto<List<ChatMessageRespDto>>> getChatMessages(
            @PathVariable Long roomId) {
        List<ChatMessageRespDto> messages = chatService.getChatMessages(roomId);
        return ResponseEntity.ok(ApiRespDto.success(messages));
    }
}




