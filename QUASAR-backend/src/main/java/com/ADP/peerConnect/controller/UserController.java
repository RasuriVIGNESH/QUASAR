package com.ADP.peerConnect.controller;


import com.ADP.peerConnect.model.dto.request.User.UpdateUserRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.dto.response.UserSkillResponse;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Impl.FileStorageService;
import com.ADP.peerConnect.service.Interface.iUserService;
import com.ADP.peerConnect.service.Interface.iUserSkillService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

/**
 * REST controller for user management operations
 */
@RestController
@RequestMapping(Constants.USER_BASE_PATH)
@Tag(name = "Student Management", description = "Student management APIs")
public class UserController {

        @Autowired
        private iUserService userService;

        @Autowired
        private FileStorageService fileStorageService;

        private final iUserSkillService Userskill;

    public UserController(iUserSkillService userskill) {
        Userskill = userskill;
    }


    /**
         * Get user profile by ID
         */
        @GetMapping("/{userId}")
        @Operation(summary = "Get user profile", description = "Get user profile by ID")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile retrieved"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
        })
        public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(
                        @Parameter(description = "User ID") @PathVariable String userId) {

                User user = userService.findById(userId);
                UserResponse userResponse = new UserResponse(user);

                ApiResponse<UserResponse> response = ApiResponse.success(
                                "User profile retrieved successfully", userResponse);

                return ResponseEntity.ok(response);
        }

        /**
         * Update current user profile
         */
        @PutMapping("/profile")
        @Operation(summary = "Update user profile", description = "Update current user profile")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
                        @Valid @RequestBody UpdateUserRequest updateRequest,
                        @Parameter(hidden = true)
                        @AuthenticationPrincipal UserPrincipal currentUser) {

                User user = userService.findById(currentUser.getId());

                // Update fields if provided
                if (updateRequest.getFirstName() != null) {
                        user.setFirstName(updateRequest.getFirstName());
                }
                if (updateRequest.getLastName() != null) {
                        user.setLastName(updateRequest.getLastName());
                }
                if (updateRequest.getBio() != null) {
                        user.setBio(updateRequest.getBio());
                }
                if (updateRequest.getBranch() != null) {
                        user.setBranch(updateRequest.getBranch());
                }
                if (updateRequest.getGraduationYear() != null) {
                        user.setGraduationYear(updateRequest.getGraduationYear());
                }
                if (updateRequest.getAvailabilityStatus() != null) {
                        user.setAvailabilityStatus(updateRequest.getAvailabilityStatus());
                }
                if (updateRequest.getProfilePictureUrl() != null) {
                        user.setProfilePictureUrl(updateRequest.getProfilePictureUrl());
                }
                if (updateRequest.getGithubUrl() != null)
                        user.setGithubUrl(updateRequest.getGithubUrl());
                if (updateRequest.getLinkedinUrl() != null)
                        user.setLinkedinUrl(updateRequest.getLinkedinUrl());
                if (updateRequest.getPortfolioUrl() != null)
                        user.setPortfolioUrl(updateRequest.getPortfolioUrl());

                User updatedUser = userService.update(user);
                UserResponse userResponse = new UserResponse(updatedUser);

                ApiResponse<UserResponse> response = ApiResponse.success(
                                "Profile updated successfully", userResponse);

                return ResponseEntity.ok(response);
        }
        @GetMapping("/users/{userId}/skills")
        public ResponseEntity<List<UserSkillResponse>> getUserSkills(
                @PathVariable String userId
        ) {
                return ResponseEntity.ok(Userskill.getUserSkills(userId));
        }

        /**
         * Update user profile photo
         */
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

        /**
         * Delete user profile photo
         */
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



        /**
         * Update availability status
         */
        @PutMapping("/availability")
        @Operation(summary = "Update availability status", description = "Update current user availability status")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Availability updated successfully")
        })
        public ResponseEntity<ApiResponse<UserResponse>> updateAvailability(
                        @Parameter(description = "New availability status") @RequestParam AvailabilityStatus status,
                        @Parameter(hidden = true)
                        @AuthenticationPrincipal UserPrincipal currentUser) {

                User updatedUser = userService.updateAvailabilityStatus(currentUser.getId(), status);
                UserResponse userResponse = new UserResponse(updatedUser);

                ApiResponse<UserResponse> response = ApiResponse.success(
                                "Availability updated successfully", userResponse);

                return ResponseEntity.ok(response);

        }

}
