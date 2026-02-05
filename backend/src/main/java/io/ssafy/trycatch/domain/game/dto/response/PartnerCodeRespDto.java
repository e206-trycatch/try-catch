package io.ssafy.trycatch.domain.game.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerCodeRespDto {
    private String partnerPosition;
    private List<FileItem> files;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileItem {
        private String codeRole;
        private String filePath;
        private String fileType;
        private String code;
    }
}