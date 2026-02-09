package io.ssafy.trycatch.domain.room.repository;

import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ProblemFile Repository
@Repository
public interface ProblemFileRepository extends JpaRepository<ProblemFile, Long> {

    // problemFrameworkId로 모든 파일 조회 (filePath 순서대로 정렬)
    List<ProblemFile> findByProblemFrameworkIdAndIsDeletedOrderByFilePath(
            Long problemFrameworkId, TrueOrFalse isDeleted);

    // problemFrameworkId와 fileType으로 조회 (DOC 파일만 가져오기)
    List<ProblemFile> findByProblemFrameworkIdAndFileTypeAndIsDeleted(
            Long problemFrameworkId, FileType fileType, TrueOrFalse isDeleted);
}