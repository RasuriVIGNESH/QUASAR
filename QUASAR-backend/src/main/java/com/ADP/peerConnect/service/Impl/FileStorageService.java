package com.ADP.peerConnect.service.Impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${imagesFolderURL}")
    private String uploadDir;

    public String saveFile(MultipartFile file) throws IOException {

        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf("."));

        String fileName = UUID.randomUUID() + extension;

        Path path = Paths.get(uploadDir + fileName);

        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        // IMPORTANT → return accessible URL
        return "http://localhost:8080/images/" + fileName;
    }
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            // Extract filename from URL
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            Path path = Paths.get(uploadDir + fileName);

            Files.deleteIfExists(path);

        } catch (Exception e) {
            System.out.println("Failed to delete file: " + e.getMessage());
        }
    }
}