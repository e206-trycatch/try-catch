package io.ssafy.trycatch.domain.game.entity;

import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "saved_code",
        uniqueConstraints = {
                @UniqueConstraint( // room_id + problem_framework_id + user_id + file_path 조합 설정
                        name = "uq_saved_code_room_problem_user_file",
                        columnNames = {"room_id", "problem_framework_id", "user_id", "file_path"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private Long problemFrameworkId;

    @Column(nullable = false)
    private Long userId;

    @Column
    private Integer version = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomPosition codeRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionFile.FileType fileType;

    @Column(columnDefinition = "TEXT")
    private String filePath;

    @Lob // Large Object
    @Column(columnDefinition = "TEXT")
    private String code;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrueOrFalse isDeleted;
}
