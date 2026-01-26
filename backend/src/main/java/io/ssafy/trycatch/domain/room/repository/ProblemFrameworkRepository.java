package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.ProblemFramework;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// ProblemFramework Repository
@Repository
public interface ProblemFrameworkRepository extends JpaRepository<ProblemFramework, Long> {

    // questId, frontendId, backendId로 ProblemFramework 조회
    Optional<ProblemFramework> findByQuestIdAndFrontendIdAndBackendIdAndIsDeleted(
            Long questId, Long frontendId, Long backendId, TrueOrFalse isDeleted);
}