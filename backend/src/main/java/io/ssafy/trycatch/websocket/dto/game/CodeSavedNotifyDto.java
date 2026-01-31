package io.ssafy.trycatch.websocket.dto.game;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CodeSavedNotifyDto {
    private Long userId;
    private String nickname;
    private String position;
    private LocalDateTime savedAt;
}