package io.ssafy.trycatch.domain.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestStoryRespDto {

    // 스토리 ID
    private Long storyId;

    // 스토리 순서
    private Integer storyOrder;

    // 이미지 URL
    private String imageUrl;

    // 스토리 내용
    private String content;
}