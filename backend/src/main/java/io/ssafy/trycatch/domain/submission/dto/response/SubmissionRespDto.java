package io.ssafy.trycatch.domain.submission.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubmissionRespDto {

    private Long submissionId;
    private Long roomId;
    private Long questId;
    private String status;
    private Integer score;
    private Long executionTimeMs;
    private RoomState roomState;
    private List<RoleInfo> roles;
    private NextQuest next;
    private String errorLog;

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RoomState {
        // 성공 시
        private Integer life;
        // 실패 시
        private Integer lifeAfter;
        private Integer remainingHintCount;
    }

    @Getter
    @Builder
    public static class RoleInfo {
        private String role;
        private Long frameworkId;
    }

    @Getter
    @Builder
    public static class NextQuest {
        private Boolean hasNextQuest;
        private Long nextQuestId;
    }
}