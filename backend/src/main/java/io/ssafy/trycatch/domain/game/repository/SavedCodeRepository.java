package io.ssafy.trycatch.domain.game.repository;

import io.ssafy.trycatch.domain.game.entity.SavedCode;
import io.ssafy.trycatch.domain.room.enums.RoomPosition;
import io.ssafy.trycatch.domain.submission.entity.SubmissionFile;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedCodeRepository extends JpaRepository<SavedCode, Long> {

    List<SavedCode> findByRoomIdAndProblemFrameworkIdAndCodeRoleAndIsDeleted(
            Long roomId,
            Long problemFrameworkId,
            RoomPosition codeRole,
            TrueOrFalse isDeleted
    );
}