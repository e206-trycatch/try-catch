package io.ssafy.trycatch.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// 문제 파일 목록 응답 DTO
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemFilesRespDto {

    // 문제 프레임워크 ID
    private Long problemFrameworkId;

    // 프론트엔드 에러 로그
    private String frontendErrorLog;

    // 백엔드 에러 로그
    private String backendErrorLog;

    // 파일 목록
    private List<ProblemFileRespDto> files;
}