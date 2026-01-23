package io.ssafy.trycatch.domain.submission.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class SubmissionReqDto {

    private SubmissionItem frontend;
    private SubmissionItem backend;

    @Getter
    @NoArgsConstructor
    public static class SubmissionItem {
        private Long problemFrameworkId;
        private List<FileItem> files;
    }

    @Getter
    @NoArgsConstructor
    public static class FileItem {
        private Long fileId;
        private String filePath;
        private String fileType;
        private String code;
    }
}