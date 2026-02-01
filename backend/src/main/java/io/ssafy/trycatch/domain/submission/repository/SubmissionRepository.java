package io.ssafy.trycatch.domain.submission.repository;

import io.ssafy.trycatch.domain.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
