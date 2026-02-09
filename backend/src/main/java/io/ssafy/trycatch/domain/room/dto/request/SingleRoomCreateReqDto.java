package io.ssafy.trycatch.domain.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SingleRoomCreateReqDto {
    private Long themeId;
    private String position;
    private Long frontId;
    private Long backId;
}
