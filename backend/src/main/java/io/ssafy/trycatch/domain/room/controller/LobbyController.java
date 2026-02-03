package io.ssafy.trycatch.domain.room.controller;

import io.ssafy.trycatch.domain.room.service.MultiRoomService;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import io.ssafy.trycatch.websocket.dto.lobby.GuestJoinedDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class LobbyController {

    private final MultiRoomService multiRoomService;

    @MessageMapping("/rooms/{roomId}/join")
    @SendTo("/topic/rooms/{roomId}")
    public SocketRespDto<GuestJoinedDto> handleJoin(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = Long.parseLong(principal.getName());

        GuestJoinedDto guestInfo = multiRoomService.getGuestJoinedInfo(roomId, userId);

        return SocketRespDto.of(SocketEventType.PLAYER_JOINED, guestInfo);
    }
}