package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.PayloadTooLargeException;
import com.ADP.peerConnect.exception.ServiceUnavailableException;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import software.amazon.awssdk.core.exception.SdkException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private final S3Client s3Client;
    private final UserService userService;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    public FileStorageService(S3Client s3Client, UserService userService) {
        this.s3Client = s3Client;
        this.userService = userService;
    }

    // ─── Public API ──────────────────────────────────────────────────────────────

    public UserResponse updateProfilePhoto(MultipartFile file, String userId) {
        validateFile(file);
        User existing = userService.findById(userId);
        String oldImageUrl = existing.getProfilePictureUrl();
        String imageUrl = uploadToS3(file);
        User updated = userService.updateProfilePicture(userId, imageUrl);
        try {
            deleteFromS3(oldImageUrl);
        } catch (ServiceUnavailableException cleanupFailure) {
            // The new image is active; cleanup failure must not make the client retry the update.
            log.warn("New profile image saved, but previous image cleanup failed.", cleanupFailure);
        }

        return new UserResponse(updated);
    }

    public void deleteProfilePhoto(String userId) {
        User user = userService.findById(userId);
        String oldImageUrl = user.getProfilePictureUrl();
        deleteFromS3(oldImageUrl);
        user.setProfilePictureUrl(null);
        userService.update(user);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new PayloadTooLargeException("File size must not exceed 5 MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed.");
        }
    }

    private String uploadToS3(MultipartFile file) {
        try {
            String key = "peerConnect/uploads/" + UUID.randomUUID() + extractExtension(file.getOriginalFilename());

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

            return "https://s3." + region + ".amazonaws.com/" + bucketName + "/" + key;

        } catch (IOException | SdkException e) {
            log.error("Profile image upload failed", e);
            throw new ServiceUnavailableException("Image storage is temporarily unavailable. Please try again.", e);
        }
    }

    private void deleteFromS3(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        if (!fileUrl.contains(".amazonaws.com/")) return;

        try {
            String key = extractKey(fileUrl);

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());

        } catch (SdkException e) {
            log.error("Profile image deletion failed", e);
            throw new ServiceUnavailableException("Image storage is temporarily unavailable. Please try again.", e);
        }
    }

    private String extractKey(String fileUrl) {
        String marker = ".amazonaws.com/";
        int idx = fileUrl.indexOf(marker);
        if (idx == -1) throw new BadRequestException("Profile image URL is invalid.");
        return fileUrl.substring(idx + marker.length());
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return "." + filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
