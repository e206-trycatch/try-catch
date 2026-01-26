package io.ssafy.trycatch.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 퀘스트 상세 정보 응답 DTO
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestDetailRespDto {

    // 퀘스트 ID
    private Long questId;

    // 퀘스트 순서
    private Integer questOrder;

    // 퀘스트 제목
    private String title;

    // 퀘스트 설명
    private String description;
}