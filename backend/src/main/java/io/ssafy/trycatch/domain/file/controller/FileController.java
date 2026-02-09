package io.ssafy.trycatch.domain.file.controller;

import io.ssafy.trycatch.domain.file.service.MinioService;
import io.ssafy.trycatch.global.common.ApiRespDto;
import io.ssafy.trycatch.global.exception.CustomException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;

import static io.ssafy.trycatch.global.exception.ErrorCode.FILE_UPLOAD_FAIL;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final MinioService minioService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam String bucket
    ) {
        try {
            String url = minioService.uploadFile(file, bucket);
            return ResponseEntity.ok(ApiRespDto.success(Map.of(
                    "success", true,
                    "url", url,
                    "fileName", file.getOriginalFilename()
            )));
        } catch (Exception e) {
            log.error("User profile upload failed", e);
            throw new CustomException(FILE_UPLOAD_FAIL);
        }
    }

    /**
     * 이미지 조회 (공통)
     * GET /api/files/image/{bucket}/{folder}/{fileName}
     */
    @GetMapping("/image/**")
    public ResponseEntity<InputStreamResource> getImage(HttpServletRequest request) {
        try {
            String requestURI = request.getRequestURI();
            String fileName = requestURI.replace("/api/v1/files/image/", "");

            log.info("Fetching image: {}", fileName);

            InputStream stream = minioService.downloadFile(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(getContentType(fileName)))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(new InputStreamResource(stream));

        } catch (Exception e) {
            log.error("Image not found: {}", request.getRequestURI(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 삭제
     * DELETE /api/files?url={fileUrl}
     */
    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam String url) {
        try {
            minioService.deleteFileByUrl(url);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("File delete failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false));
        }
    }

    /**
     * Content-Type 판단
     */
    private String getContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "svg" -> "image/svg+xml";
            default -> "application/octet-stream";
        };
    }
}