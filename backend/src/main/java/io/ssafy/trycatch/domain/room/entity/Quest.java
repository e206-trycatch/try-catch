package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 퀘스트 Entity
@Entity
@Table(name = "quest")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 테마 ID
    @Column(name = "theme_id", nullable = false)
    private Long themeId;

    // 퀘스트 순서
    @Column(name = "quest_order", nullable = false)
    private Integer questOrder;

    // 퀘스트 제목
    @Column(name = "title", nullable = false)
    private String title;

    // 퀘스트 설명
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // 삭제 여부
    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private TrueOrFalse isDeleted = TrueOrFalse.F;

    // 생성 시간
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 시간
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}