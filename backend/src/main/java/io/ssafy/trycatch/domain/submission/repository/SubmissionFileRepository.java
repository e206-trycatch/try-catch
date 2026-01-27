package io.ssafy.trycatch.domain.submission.repository;

import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, Long> {
    List<SubmissionFile> findBySubmissionIdAndIsDeleted(Long submissionId, TrueOrFalse isDeleted);
}
