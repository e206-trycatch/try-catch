package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "framework")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Framework {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "language", length = 255)
    private String language;

    @Column(name = "category", nullable = false, columnDefinition = "ENUM('FRONTEND','BACKEND') DEFAULT 'FRONTEND'")
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    private TrueOrFalse isDeleted = TrueOrFalse.F;
}