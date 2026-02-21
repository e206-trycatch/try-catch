package io.ssafy.trycatch.domain.submission.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
public class SubmissionReqDto {

    private Long problemFrameworkId;
    private SubmissionItem frontend;
    private SubmissionItem backend;

    @Getter @Setter
    @NoArgsConstructor
    public static class SubmissionItem {
        private List<FileItem> files;
    }

    @Getter @Setter
    @NoArgsConstructor
    public static class FileItem {
        private String filePath;
        private String fileType;
        private String code;
    }
}