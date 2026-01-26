package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// 퀘스트 스토리 Entity
@Entity
@Table(name = "quest_story")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 퀘스트
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    // 스토리 순서
    @Column(name = "story_order", nullable = false)
    private Integer storyOrder;

    // 이미지 URL
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // 스토리 내용
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    // 삭제 여부
    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private TrueOrFalse isDeleted = TrueOrFalse.F;

    // 생성 시간
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}