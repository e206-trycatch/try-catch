package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.domain.room.enums.RoomMode;
import io.ssafy.trycatch.domain.room.enums.RoomStatus;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 게임 방 Entity
@Entity
@Table(name = "room")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    // ID(PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 테마 ID
    @Column(name = "theme_id", nullable = false)
    private Long themeId;

    // 프론트엔드 프레임워크 ID
    @Column(name = "frontend_id")
    private Long frontendId;

    // 백엔드 프레임워크 ID
    @Column(name = "backend_id")
    private Long backendId;

    // 방 제목
    @Column(name = "room_name", length = 255)
    private String roomName;

    // 방 모드 (SINGLE, MULTI)
    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false)
    private RoomMode mode;

    // 방 상태 (CREATED, PLAYING, ENDED)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.CREATED;

    // 게임 시작 시간
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    // 초대 코드 (멀티 플레이용)
    @Column(name = "invited_code", length = 255, unique = true)
    private String invitedCode;

    // 남은 생명 (기본값 3)
    @Column(name = "life", nullable = false)
    @Builder.Default
    private Integer life = 3;

    // 남은 힌트 개수 (기본값 3)
    @Column(name = "remaining_hint_count", nullable = false)
    @Builder.Default
    private Integer remainingHintCount = 3;

    // 삭제 여부
    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    private TrueOrFalse isDeleted = TrueOrFalse.F;

    // 생성 시간
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 시간
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void decreaseLife() {
        if (this.life > 0) {
            this.life--;
        }
    }

    public void useHint() {
        if (this.remainingHintCount > 0) {
            this.remainingHintCount--;
        }
    }

    public void startGame() {
        this.status = RoomStatus.PLAYING;
        this.startedAt = LocalDateTime.now();
    }

    public void startQuestGame() {
        this.startedAt = LocalDateTime.now();
    }

    public void endGame() {
        this.status = RoomStatus.ENDED;
    }

    public boolean isGameOver() {
        return this.life <= 0;
    }

    // 기본 목숨 3으로 초기화
    public void resetLife() {
        this.life = 3;
    }

    // 힌트 3으로 초기화
    public void resetHint() {
        this.remainingHintCount = 3;
    }
}