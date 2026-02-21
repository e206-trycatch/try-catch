package io.ssafy.trycatch.domain.game.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CodeSaveReqDto {
    private Long problemFrameworkId;
    private List<FileItem> files;

    @Getter @Setter
    @NoArgsConstructor
    public static class FileItem {
        private String filePath;
        private String fileType;
        private String code;
    }

}
