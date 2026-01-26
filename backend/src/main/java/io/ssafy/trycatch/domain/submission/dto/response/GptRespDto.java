package io.ssafy.trycatch.domain.submission.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class GptRespDto {
    private List<Choice> choices;
    private Usage usage;

    @Getter
    @NoArgsConstructor
    public static class Choice {
        private Message message;
        private Integer index;
        private String finishReason;
    }

    @Getter
    @NoArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }

    @Getter
    @NoArgsConstructor
    public static class Usage {
        private Integer promptTokens;
        private Integer completionTokens;
        private Integer totalTokens;
    }
}
