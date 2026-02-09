package io.ssafy.trycatch.global.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Slf4j
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioConfigProperties {

    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
}