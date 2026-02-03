package io.ssafy.trycatch.domain.submission.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "problem_framework_id", nullable = false)
    private Long problemFrameworkId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.FAIL;

    @Column(name = "execution_time")
    private Long executionTime;

    @Column(name = "error_log", columnDefinition = "TEXT")
    private String errorLog;

    @Column
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false)
    private ProcessingStatus processingStatus = ProcessingStatus.PENDING;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    private IsDeleted isDeleted = IsDeleted.F;

    // 소프트 삭제
    public void delete() {
        this.isDeleted = IsDeleted.T;
    }

    // 복구
    public void restore() {
        this.isDeleted = IsDeleted.F;
    }

    @Builder
    public Submission(Long userId, Long roomId, Long problemFrameworkId,
                      Status status, Long executionTime,
                      String errorLog, Integer score, LocalDateTime submittedAt) {
        this.userId = userId;
        this.roomId = roomId;
        this.problemFrameworkId = problemFrameworkId;
        this.status = status != null ? status : Status.FAIL;
        this.executionTime = executionTime;
        this.errorLog = errorLog;
        this.score = score;
        this.processingStatus = ProcessingStatus.PENDING;  // 항상 PENDING으로 초기화
        this.submittedAt = submittedAt;
    }

    public void updateResult(Status status, Long executionTime, String errorLog, Integer score) {
        this.status = status;
        this.executionTime = executionTime;
        this.errorLog = errorLog;
        this.score = score;
        this.processingStatus = ProcessingStatus.COMPLETED;  // 완료 시 업데이트
    }

    public enum Status {
        SUCCESS, FAIL
    }

    public enum IsDeleted {
        T, F
    }

    public enum ProcessingStatus {
        PENDING, COMPLETED
    }

}
