package io.ssafy.trycatch.domain.game.service;

import io.ssafy.trycatch.domain.game.dto.request.ChatMessageReqDto;
import io.ssafy.trycatch.domain.game.dto.response.ChatMessageRespDto;
import io.ssafy.trycatch.domain.game.entity.Chat;
import io.ssafy.trycatch.domain.game.repository.ChatRepository;
import io.ssafy.trycatch.domain.room.repository.RoomRepository;
import io.ssafy.trycatch.domain.user.repository.UserRepository;
import io.ssafy.trycatch.websocket.common.SocketEventType;
import io.ssafy.trycatch.websocket.dto.SocketRespDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 메시지 전송
     */
    public ChatMessageRespDto sendMessage(Long roomId, Long senderId, ChatMessageReqDto request) {
        // 발신자 정보 조회
        var sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다."));

        // 게임방 존재 여부 확인
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("게임방을 찾을 수 없습니다."));

        // 메시지 생성 및 저장
        LocalDateTime now = LocalDateTime.now();
        long timestamp = System.currentTimeMillis();

        Chat chat = Chat.builder()
                .id(UUID.randomUUID().toString())
                .roomId(roomId)
                .senderId(senderId)
                .senderNickname(sender.getNickname())
                .senderProfileUrl(sender.getProfileUrl() != null ? sender.getProfileUrl() : "")
                .message(request.getMessage())
                .timestamp(timestamp)
                .sentAt(now)
                .build();

        chatRepository.save(chat);

        ChatMessageRespDto response = ChatMessageRespDto.from(chat);
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/game",
                SocketRespDto.of(SocketEventType.CHAT_MESSAGE, response)
        );

        return ChatMessageRespDto.from(chat);
    }

    /**
     * 특정 게임방의 채팅 메시지 목록 조회
     */
    public List<ChatMessageRespDto> getChatMessages(Long roomId) {
        List<Chat> chats = chatRepository.findByRoomIdOrderBySentAtAsc(roomId);

        return chats.stream()
                .map(ChatMessageRespDto::from)
                .collect(Collectors.toList());
    }
}




