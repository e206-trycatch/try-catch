package io.ssafy.trycatch.domain.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestDetailReqDto {

    private Long themeId;

    private Long questId;
}
