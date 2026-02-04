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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
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
            SimpMessageHeaderAccessor headerAccessor) {

        // 세션에서 userId 가져오기
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            log.error("세션에 userId가 없습니다. roomId={}", roomId);
            throw new IllegalStateException("인증되지 않은 사용자입니다.");
        }

        GuestJoinedDto guestInfo = multiRoomService.getGuestJoinedInfo(roomId, userId);

        return SocketRespDto.of(SocketEventType.PLAYER_JOINED, guestInfo);
    }

    @MessageMapping("/rooms/{roomId}/ready")
    @SendTo("/topic/rooms/{roomId}")
    public SocketRespDto<ReadyStatusDto> handleReady(
            @DestinationVariable Long roomId,
            SimpMessageHeaderAccessor headerAccessor) {

        // 세션에서 userId 가져오기
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            log.error("세션에 userId가 없습니다. roomId={}", roomId);
        }

        ReadyStatusDto readyStatus = multiRoomService.toggleReady(roomId, userId);

        if (multiRoomService.checkAllReady(roomId)) {

            messagingTemplate.convertAndSend(
                    "/topic/rooms/" + roomId,
                    SocketRespDto.of(SocketEventType.GAME_STARTED,
                            roomId)
            );
        }

        return SocketRespDto.of(SocketEventType.READY_CHANGED, readyStatus);
    }

    @MessageMapping("/rooms/{roomId}/quest/ready")
    @SendTo("/topic/rooms/{roomId}/quest")
    public SocketRespDto<QuestReadyStatusDto> handleQuestReady(
            @DestinationVariable Long roomId,
            @Payload QuestReadyReqDto request,
            SimpMessageHeaderAccessor headerAccessor) {

        // 세션에서 userId 가져오기
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            log.error("세션에 userId가 없습니다. roomId={}", roomId);
            throw new IllegalStateException("인증되지 않은 사용자입니다.");
        }

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