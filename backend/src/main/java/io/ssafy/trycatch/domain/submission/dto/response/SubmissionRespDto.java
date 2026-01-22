package io.ssafy.trycatch.domain.submission.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SubmissionRespDto {

    private Long submissionId;
    private Long roomId;
    private String status;
    private Integer score;
    private Long executionTimeMs;
    private RoomState roomState;
    private List<RoleInfo> roles;
    private NextQuest next;
    private String errorLog;

    @Getter
    @Builder
    public static class RoomState {
        private Integer life;
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