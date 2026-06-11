package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Impl.FileStorageService;
import com.ADP.peerConnect.service.Impl.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RequestMapping("/api/students/")
@RestController
public class FileController {
    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    @PostMapping("/profile-photo")
    @Operation(summary = "Update profile photo", description = "Update current user profile photo with image file")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile photo updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or file"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateProfilePhoto(
            @RequestParam("profilePhoto") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("File is required", null));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("File size must not exceed 5MB", null));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Only image files are allowed", null));
        }
        User oldUser = userService.findById(currentUser.getId());

        fileStorageService.deleteFile(oldUser.getProfilePictureUrl());
        // ✅ NEW LOGIC
        String imageUrl = fileStorageService.saveFile(file);

        User user = userService.updateProfilePicture(currentUser.getId(), imageUrl);

        return ResponseEntity.ok(
                ApiResponse.success("Profile photo updated successfully", new UserResponse(user))
        );
    }

    @DeleteMapping("/profile-photo")
    @Operation(summary = "Delete profile photo", description = "Delete current user profile photo")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile photo deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<String>> deleteProfilePhoto(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userService.findById(currentUser.getId());

        fileStorageService.deleteFile(user.getProfilePictureUrl());

        // remove URL from DB
        user.setProfilePictureUrl(null);
        userService.update(user);

        return ResponseEntity.ok(
                ApiResponse.success("Profile photo deleted successfully", null)
        );
    }
}
