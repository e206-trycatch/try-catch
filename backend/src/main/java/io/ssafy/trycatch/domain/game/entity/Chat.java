package io.ssafy.trycatch.domain.game.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "chat", timeToLive = 86400) // 24시간 TTL
public class Chat {

    @Id
    private String id; // Redis의 키로 사용될 ID

    @Indexed
    private Long roomId; // 게임방 ID

    private Long senderId;
    private String senderNickname;
    private String senderProfileUrl;

    private String message;

    private Long timestamp; // System.currentTimeMillis() 형식으로 저장

    private LocalDateTime sentAt; // 서버 시간
}