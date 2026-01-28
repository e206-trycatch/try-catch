package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import io.ssafy.trycatch.domain.room.enums.RoomRole;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_user")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_ready", nullable = false)
    @Builder.Default
    private TrueOrFalse isReady = TrueOrFalse.F;

    @Enumerated(EnumType.STRING)
    @Column(name = "position")
    private RoomPosition position;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private RoomRole role = RoomRole.HOST;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private TrueOrFalse isDeleted = TrueOrFalse.F;

    // 비즈니스 메서드
    public void updateReady(TrueOrFalse isReady) {
        this.isReady = isReady;
    }

    public void updateRole(RoomRole role) {
        this.role = role;
    }

    public void delete() {
        this.isDeleted = TrueOrFalse.T;
    }

    public boolean isHost() {
        return this.role == RoomRole.HOST;
    }

    public boolean isReady() {
        return this.isReady == TrueOrFalse.F;
    }
}