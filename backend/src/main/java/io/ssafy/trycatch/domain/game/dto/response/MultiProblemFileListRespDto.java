package io.ssafy.trycatch.domain.game.dto.response;

import io.ssafy.trycatch.domain.room.dto.response.ProblemFileRespDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiProblemFileListRespDto {      // 멀티 - 문제 파일 목록 응답 DTO

    // 문제 프레임워크 ID
    private Long problemFrameworkId;

    // 유저의 포지션 name (싱글에서 이것 하나만 추가됨)
    private String myPosition;

    // 프론트엔드 에러 로그
    private String frontendErrorLog;

    // 백엔드 에러 로그
    private String backendErrorLog;

    // 파일 목록
    private List<ProblemFileRespDto> files;
}