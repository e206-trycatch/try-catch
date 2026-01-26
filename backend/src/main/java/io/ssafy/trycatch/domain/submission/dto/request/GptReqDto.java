package io.ssafy.trycatch.domain.submission.dto.request;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GptReqDto {
    private String model;
    private List<Message> messages;
    private Double temperature;
    private ResponseFormat responseFormat;

    @Getter
    @Builder
    public static class Message {
        private String role;
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    @Getter
    @Builder
    public static class ResponseFormat {
        private String type;
    }
}
