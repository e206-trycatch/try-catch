package io.ssafy.trycatch.domain.submission.repository;

import io.ssafy.trycatch.domain.submission.entity.Submission;
import jakarta.persistence.LockModeType;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findTopByRoomIdAndUserIdOrderBySubmittedAtDesc(Long roomId, Long userId);

    // 같은 시간에 제출된 모든 submission 조회 (Frontend + Backend)
    List<Submission> findByRoomIdAndUserIdAndSubmittedAtOrderByIdAsc(
            Long roomId, Long userId, LocalDateTime submittedAt);

    Optional<Submission> findTopByRoomIdOrderBySubmittedAtDesc(Long roomId);

    boolean existsByRoomIdAndUserIdAndProblemFrameworkIdAndProcessingStatus(Long roomId, Long userId, Long problemFrameworkId, Submission.ProcessingStatus processingStatus);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Submission s WHERE s.roomId = :roomId " +
            "AND s.userId = :userId " +
            "AND s.problemFrameworkId = :problemFrameworkId " +
            "AND s.processingStatus = :processingStatus")
    Optional<Submission> findPendingForUpdate(
            @Param("roomId") Long roomId,
            @Param("userId") Long userId,
            @Param("problemFrameworkId") Long problemFrameworkId,
            @Param("processingStatus") Submission.ProcessingStatus processingStatus);

    List<Submission> findByRoomIdAndSubmittedAtOrderByIdAsc(Long roomId, LocalDateTime submittedAt);
}
