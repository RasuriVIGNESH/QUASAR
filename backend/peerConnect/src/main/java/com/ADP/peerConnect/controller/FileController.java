package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Impl.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/api/students/")
@RestController
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/profile-photo")
    @Operation(summary = "Update profile photo", description = "Update current user profile photo with image file")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile photo updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or file"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateProfilePhoto(
            @RequestParam("profilePhoto") MultipartFile file,
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserResponse response = fileStorageService.updateProfilePhoto(file, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated successfully", response));
    }

    @DeleteMapping("/profile-photo")
    @Operation(summary = "Delete profile photo", description = "Delete current user profile photo")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile photo deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<String>> deleteProfilePhoto(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal currentUser) {

        fileStorageService.deleteProfilePhoto(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile photo deleted successfully", null));
    }
}