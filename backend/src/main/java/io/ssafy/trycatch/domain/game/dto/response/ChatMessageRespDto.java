package io.ssafy.trycatch.domain.game.dto.response;

import io.ssafy.trycatch.domain.game.entity.Chat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRespDto {
    private String id;
    private Long userId;
    private String nickname;
    private String profileUrl;
    private String message;
    private Long timestamp;
    private LocalDateTime sentAt;

    public static ChatMessageRespDto from(Chat chat) {
        return ChatMessageRespDto.builder()
                .id(chat.getId())
                .userId(chat.getSenderId())
                .nickname(chat.getSenderNickname())
                .profileUrl(chat.getSenderProfileUrl())
                .message(chat.getMessage())
                .timestamp(chat.getTimestamp())
                .sentAt(chat.getSentAt())
                .build();
    }
}
