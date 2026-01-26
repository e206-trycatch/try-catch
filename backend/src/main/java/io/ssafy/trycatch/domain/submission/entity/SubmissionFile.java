package io.ssafy.trycatch.domain.submission.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class SubmissionFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false)
    private Long submissionId;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "code_role", nullable = false)
    private CodeRole codeRole = CodeRole.FRONTEND;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false)
    private FileType fileType = FileType.SOURCE;

    @Column(columnDefinition = "TEXT")
    private String code;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    private Submission.IsDeleted isDeleted = Submission.IsDeleted.F;

    // 소프트 삭제
    public void delete() {
        this.isDeleted = Submission.IsDeleted.T;
    }

    // 복구
    public void restore() {
        this.isDeleted = Submission.IsDeleted.F;
    }

    @Builder
    public SubmissionFile(Long submissionId, String filePath,
                          CodeRole codeRole, FileType fileType, String code) {
        this.submissionId = submissionId;
        this.filePath = filePath;
        this.codeRole = codeRole != null ? codeRole : CodeRole.FRONTEND;
        this.fileType = fileType != null ? fileType : FileType.SOURCE;
        this.code = code;
    }

    public enum CodeRole {
        BACKEND, FRONTEND
    }

    public enum FileType {
        SOURCE, CONFIG, TEST, DOC, ASSET
    }

    public enum IsDeleted {
        T, F
    }
}
