package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 개별 문제 파일 DTO
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemFileRespDto {

    // 파일 ID
    private Long fileId;

    // 파일 경로
    private String filePath;

    // 코드 역할 (FRONTEND/BACKEND)
    private FrameworkCategory codeRole;

    // 파일 코드 내용
    private String code;

    // 파일 종류 (SOURCE/CONFIG/TEST/DOC/ASSET)
    private FileType fileType;
}