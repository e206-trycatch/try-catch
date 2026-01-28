package io.ssafy.trycatch.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SubmissionHistoryRespDto {

    private String message;
    private Result result;

    @Getter
    @Builder
    public static class Result {
        private List<SubmissionHistory> submissions;
        private PageInfo pageInfo;
    }

    @Getter
    @Builder
    public static class SubmissionHistory {
        private Long submissionId;
        private String gameMode;
        private String themeName;
        private String frameworkName;
        private Long executionTime;
        private LocalDateTime submittedAt;
    }

    @Getter
    @Builder
    public static class PageInfo {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int size;
    }

    public static SubmissionHistoryRespDto success(List<SubmissionHistory> submissions, PageInfo pageInfo) {
        return SubmissionHistoryRespDto.builder()
                .message("제출 기록 조회가 완료되었습니다.")
                .result(Result.builder()
                        .submissions(submissions)
                        .pageInfo(pageInfo)
                        .build())
                .build();
    }
}
