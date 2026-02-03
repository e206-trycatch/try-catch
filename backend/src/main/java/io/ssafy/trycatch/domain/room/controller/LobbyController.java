package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.service.MultiRoomService;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import io.ssafy.trycatch.websocket.dto.lobby.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class LobbyController {

    private final MultiRoomService multiRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/rooms/{roomId}/join")
    @SendTo("/topic/rooms/{roomId}")
    public SocketRespDto<GuestJoinedDto> handleJoin(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());

        GuestJoinedDto guestInfo = multiRoomService.getGuestJoinedInfo(roomId, userId);

        return SocketRespDto.of(SocketEventType.PLAYER_JOINED, guestInfo);
    }

    @MessageMapping("/rooms/{roomId}/ready")
    @SendTo("/topic/rooms/{roomId}")
    public SocketRespDto<ReadyStatusDto> handleReady(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());

        ReadyStatusDto readyStatus = multiRoomService.toggleReady(roomId, userId);

        return SocketRespDto.of(SocketEventType.READY_CHANGED, readyStatus);
    }

    @MessageMapping("/rooms/{roomId}/quest/ready")
    @SendTo("/topic/rooms/{roomId}/quest")
    public SocketRespDto<QuestReadyStatusDto> handleQuestReady(
            @DestinationVariable Long roomId,
            @Payload QuestReadyReqDto request,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());

        // 1. 준비 상태 토글
        multiRoomService.toggleReady(roomId, userId);

        // 2. Host, Guest 준비 상태 조회
        QuestReadyStatusDto readyStatus = multiRoomService.getQuestReadyStatus(roomId);

        // 3. 모두 준비 완료 시 START_QUEST 전송
        if (multiRoomService.checkAllReady(roomId)) {
            messagingTemplate.convertAndSend(
                    "/topic/rooms/" + roomId + "/quest",
                    SocketRespDto.of(SocketEventType.START_QUEST,
                            new StartQuestDto(roomId, request.getQuestId(), "퀘스트를 시작합니다!"))
            );
        }

        return SocketRespDto.of(SocketEventType.QUEST_READY_STATUS, readyStatus);
    }
}