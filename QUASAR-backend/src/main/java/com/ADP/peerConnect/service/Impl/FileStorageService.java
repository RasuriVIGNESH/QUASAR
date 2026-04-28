package com.ADP.peerConnect.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    // 🔼 Upload Image to Cloudinary
    public String saveFile(MultipartFile file) {

        try {
            // Optional: Validate file type
            if (!file.getContentType().startsWith("image")) {
                throw new RuntimeException("Only image files are allowed");
            }

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "quasar/uploads"
                    )
            );

            // Return secure CDN URL
            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    // 🔽 Delete Image from Cloudinary
    public void deleteFile(String fileUrl) {

        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            // Extract public_id from URL
            String publicId = extractPublicId(fileUrl);

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        } catch (Exception e) {
            System.out.println("Failed to delete file: " + e.getMessage());
        }
    }

    // 🔍 Helper: Extract public_id from Cloudinary URL
    private String extractPublicId(String fileUrl) {

        // Example URL:
        // https://res.cloudinary.com/demo/image/upload/v12345/folder/file.jpg

        String[] parts = fileUrl.split("/upload/")[1].split("\\.");

        return parts[0]; // folder/file
    }
}