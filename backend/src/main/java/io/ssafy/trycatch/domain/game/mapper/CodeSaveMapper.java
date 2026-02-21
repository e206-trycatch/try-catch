package io.ssafy.trycatch.domain.game.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CodeSaveMapper {
    /** 코드 임시저장 (Upsert)
     * - 기존 레코드가 있으면 UPDATE
     * - 없으면 INSERT
     */
    void upsertSavedCode(
            @Param("roomId") Long roomId,
            @Param("problemFrameworkId") Long problemFrameworkId,
            @Param("userId") Long userId,
            @Param("codeRole") String codeRole,
            @Param("fileType") String fileType,
            @Param("filePath") String filePath,
            @Param("code") String code
    );

    /**
     * 임시저장된 코드 조회
     */
    String findSavedCode(
            @Param("roomId") Long roomId,
            @Param("problemFrameworkId") Long problemFrameworkId,
            @Param("userId") Long userId
    );
}
