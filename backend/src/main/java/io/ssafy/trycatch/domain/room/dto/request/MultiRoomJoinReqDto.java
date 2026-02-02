package io.ssafy.trycatch.domain.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiRoomJoinReqDto {

    private String invitationCode;
}