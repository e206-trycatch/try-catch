package io.ssafy.trycatch.domain.user.mapper;

import io.ssafy.trycatch.domain.user.dto.response.SubmissionHistoryRespDto.SubmissionHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    // 제출 기록 조회
    List<SubmissionHistory> findSubmissionHistory(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    // 전체 개수 조회
    long countSubmissionHistory(@Param("userId") Long userId);
}