package io.ssafy.trycatch.domain.file.service;

import io.minio.*;
import io.ssafy.trycatch.global.config.MinioConfigProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfigProperties minioConfigProperties;

    @Value("${app.file-base-url}")
    private String fileBaseUrl;

    /**
     * 애플리케이션 시작 시 버킷 생성
     */
    @PostConstruct
    public void initBuckets() {
        try {
            ensureBucketExists(minioConfigProperties.getBucket());
            log.info("MinIO buckets initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize MinIO buckets", e);
        }
    }

    /**
     * 이미지 업로드
     */
    public String uploadFile(MultipartFile file, String bucket) throws Exception {
        String originalName = sanitizeFileName(file.getOriginalFilename());
        String fileName = bucket + "/" + UUID.randomUUID() + "_" + originalName;

        uploadToMinio(fileName, file);
        return buildFileUrl(fileName);
    }

    /**
     * 파일명 안전하게 변환 (한글, 공백, 특수문자 처리)
     */
    private String sanitizeFileName(String originalName) {
        if (originalName == null) {
            return "file";
        }

        // 확장자 분리
        String extension = "";
        String nameWithoutExt = originalName;

        int dotIndex = originalName.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);  // .jpg
            nameWithoutExt = originalName.substring(0, dotIndex);  // my-profile
        }

        // 파일명 정제 (한글은 유지, 안전하지 않은 문자만 제거)
        String safeName = nameWithoutExt
                .replaceAll("[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ._-]", "_")  // 안전한 문자만 허용
                .replaceAll("_{2,}", "_")  // 연속 언더스코어 하나로
                .replaceAll("^_|_$", "");  // 앞뒤 언더스코어 제거

        // 파일명이 너무 길면 자르기 (최대 50자)
        if (safeName.length() > 50) {
            safeName = safeName.substring(0, 50);
        }

        return safeName + extension;
    }

    /**
     * MinIO에 파일 업로드 (공통)
     */
    private void uploadToMinio(String fileName, MultipartFile file) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        log.info("File uploaded: bucket={}, file={}", bucketName, fileName);
    }

    /**
     * 파일 다운로드
     */
    public InputStream downloadFile(String fileName) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(String fileName) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );

        log.info("File deleted: bucket={}, file={}", bucketName, fileName);
    }

    /**
     * URL에서 파일명 추출하여 삭제
     */
    public void deleteFileByUrl(String fileUrl) throws Exception {
        String fileName = fileUrl.replace(fileBaseUrl + "/api/v1/files/image/", "");
        deleteFile(fileName);
    }

    /**
     * 파일 URL 생성
     */
    private String buildFileUrl(String fileName) {
        return fileBaseUrl + "/api/v1/files/image/" + fileName;
    }

    /**
     * 파일 확장자 추출
     */
    private String getExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return "";
    }

    /**
     * 버킷 존재 확인 및 생성
     */
    private void ensureBucketExists(String bucketName) throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
            log.info("Bucket created: {}", bucketName);
        }
    }
}