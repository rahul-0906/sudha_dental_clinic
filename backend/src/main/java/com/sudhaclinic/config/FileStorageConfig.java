package com.sudhaclinic.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Configuration
public class FileStorageConfig {

    @Value("${clinic.xray.upload-dir:./uploads/xrays}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created X-ray upload directory at: {}", uploadPath.toAbsolutePath());
            } else {
                log.info("X-ray upload directory exists at: {}", uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
