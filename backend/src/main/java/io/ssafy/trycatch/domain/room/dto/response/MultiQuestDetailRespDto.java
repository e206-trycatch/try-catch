package io.ssafy.trycatch.domain.room.dto.response;

import io.ssafy.trycatch.domain.room.enums.RoomRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiQuestDetailRespDto {

    // 방 ID
    private Long roomId;

    // 퀘스트 기본 정보
    private QuestDetailRespDto quest;

    // 참가자 정보 (멀티 전용)
    private List<ParticipantInfo> participants;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long userId;
        private String nickname;
        private RoomRole role;
        private String frameworkName;
        private Boolean isReady;
    }
}