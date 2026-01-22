package io.ssafy.trycatch.domain.room.entity;

import io.ssafy.trycatch.global.common.TrueOrFalse;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

import static io.ssafy.trycatch.global.common.TrueOrFalse.F;

@Entity
@Table(name = "theme")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long themeId;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "genre", length = 255, nullable = false)
    private String genre;

    @Column(name = "level")
    private Integer level;

    @Column(name = "theme_image_url", columnDefinition = "TEXT")
    private String themeImageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    private TrueOrFalse isDeleted = F;

}