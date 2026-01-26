package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 문제별 파일 Entity
@Entity
@Table(name = "problem_file")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 프레임워크별 문제 코드 ID
    @Column(name = "problem_framework_id", nullable = false)
    private Long problemFrameworkId;

    // 파일 경로
    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    // 코드 역할 (FRONTEND/BACKEND)
    @Enumerated(EnumType.STRING)
    private FrameworkCategory codeRole;

    // 파일 코드 내용
    @Column(name = "code", columnDefinition = "TEXT")
    private String code;

    // 파일 종류 (SOURCE/CONFIG/TEST/DOC/ASSET)
    @Column(name = "file_type", nullable = false, columnDefinition = "ENUM('SOURCE','CONFIG','TEST','DOC','ASSET')")
    private String fileType;

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