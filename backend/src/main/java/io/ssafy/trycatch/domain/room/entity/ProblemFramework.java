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

// 퀘스트에 대한 각 프레임워크별 문제 코드 Entity
@Entity
@Table(name = "problem_framework")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemFramework {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 퀘스트 ID
    @Column(name = "quest_id", nullable = false)
    private Long questId;

    // 프론트엔드 프레임워크 ID
    @Column(name = "frontend_id")
    private Long frontendId;

    // 백엔드 프레임워크 ID
    @Column(name = "backend_id")
    private Long backendId;

    // 프론트엔드 에러 로그
    @Column(name = "frontend_error_log", columnDefinition = "TEXT")
    private String frontendErrorLog;

    // 백엔드 에러 로그
    @Column(name = "backend_error_log", columnDefinition = "TEXT")
    private String backendErrorLog;

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