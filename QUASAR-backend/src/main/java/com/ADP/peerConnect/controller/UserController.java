package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.request.User.AddUserSkillRequest;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkillsRequest;
import com.ADP.peerConnect.model.dto.request.User.UpdateUserRequest;
import com.ADP.peerConnect.model.dto.request.User.UpdateUserSkillRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.dto.response.UserSkillResponse;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iUserService;
import com.ADP.peerConnect.service.Interface.iUserSkillService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for user management operations
 */
@RestController
@RequestMapping(Constants.USER_BASE_PATH)
@Tag(name = "User Management", description = "User management APIs")
public class UserController {

    @Autowired
    private iUserService userService;

    @Autowired
    private iUserSkillService userSkillService;

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
        if (updateRequest.getProfilePhoto() != null) {
            user.setProfilePhoto(updateRequest.getProfilePhoto());
        }
        if (updateRequest.getGithubUrl() != null) user.setGithubUrl(updateRequest.getGithubUrl());
        if (updateRequest.getLinkedinUrl() != null) user.setLinkedinUrl(updateRequest.getLinkedinUrl());
        if (updateRequest.getPortfolioUrl() != null) user.setPortfolioUrl(updateRequest.getPortfolioUrl());


        User updatedUser = userService.update(user);
        UserResponse userResponse = new UserResponse(updatedUser);

        ApiResponse<UserResponse> response = ApiResponse.success(
                "Profile updated successfully", userResponse);

        return ResponseEntity.ok(response);
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

        // Validate file size (limit to 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("File size must not exceed 5MB", null));
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Only image files are allowed", null));
        }

        byte[] imageData = file.getBytes();
        User user = userService.updateProfilePhoto(currentUser.getId(), imageData);
        UserResponse userResponse = new UserResponse(user);

        ApiResponse<UserResponse> response = ApiResponse.success(
                "Profile photo updated successfully", userResponse);

        return ResponseEntity.ok(response);
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

        userService.deleteProfilePhoto(currentUser.getId());

        ApiResponse<String> response = ApiResponse.success(
                "Profile photo deleted successfully", null);

        return ResponseEntity.ok(response);
    }



    /**
     * Update user skill
     */
    @PutMapping("/skills/{skillId}")
    @Operation(summary = "Update user skill", description = "Update a skill for current user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<ApiResponse<UserSkillResponse>> updateUserSkill(
            @Parameter(description = "User skill ID") @PathVariable Long skillId,
            @Valid @RequestBody UpdateUserSkillRequest updateRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserSkill userSkill = userSkillService.updateUserSkill(
                currentUser.getId(), skillId,
                 updateRequest.getLevel(), updateRequest.getExperience());

        UserSkillResponse skillResponse = new UserSkillResponse(userSkill);
        ApiResponse<UserSkillResponse> response = ApiResponse.success(
                "Skill updated successfully", skillResponse);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/user/count")
    @Operation(summary = "Get current user's skills count")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "skills count retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Long>> getCurrentUserSkillsCount(
            @AuthenticationPrincipal com.ADP.peerConnect.security.UserPrincipal currentUser) {
        long count = userSkillService.getUserSkillCount(currentUser.getId());
        ApiResponse<Long> response = ApiResponse.success("User skills count retrieved successfully", count);
        return ResponseEntity.ok(response);
    }


    /**
     * Add skill to current user
     */
    @PostMapping("/skills")
    @Operation(summary = "Add user skill", description = "Add a skill to current user profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Skill added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Skill already exists for user")
    })
    public ResponseEntity<ApiResponse<UserSkillResponse>> addUserSkill(
            @Valid @RequestBody AddUserSkillRequest skillRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserSkill userSkill = userSkillService.addUserSkill(
                currentUser.getId(), skillRequest.getSkillName(),
                skillRequest.getLevel(), skillRequest.getExperience());

        UserSkillResponse skillResponse = new UserSkillResponse(userSkill);

        ApiResponse<UserSkillResponse> response = ApiResponse.success(
                "Skill added successfully", skillResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Add multiple skills to current user in batch
     */
    @PostMapping("/skills/batch")
    @Operation(summary = "Add multiple user skills", description = "Add multiple skills to current user profile in a single request")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Skills added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<ApiResponse<List<UserSkillResponse>>> addUserSkillsBatch(
            @Valid @RequestBody AddUserSkillsRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<UserSkill> added = userSkillService.addUserSkills(currentUser.getId(), request.getSkills());

        List<UserSkillResponse> responses = added.stream()
                .map(UserSkillResponse::new)
                .collect(Collectors.toList());

        ApiResponse<List<UserSkillResponse>> response = ApiResponse.success("Skills added successfully", responses);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get current user skills
     */
    @GetMapping("/skills")
    @Operation(summary = "Get user skills", description = "Get current user skills")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<UserSkillResponse>>> getUserSkills(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<UserSkill> userSkills = userSkillService.getUserSkills(currentUser.getId());

        List<UserSkillResponse> skillResponses = userSkills.stream()
                .map(UserSkillResponse::new)
                .collect(Collectors.toList());

        ApiResponse<List<UserSkillResponse>> response = ApiResponse.success(
                "Skills retrieved successfully", skillResponses);

        return ResponseEntity.ok(response);
    }

    /**
     * Remove skill from current user
     */
    @DeleteMapping("/skills/{skillId}")
    @Operation(summary = "Remove user skill", description = "Remove a skill from current user profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill removed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<ApiResponse<Void>> removeUserSkill(
            @Parameter(description = "User skill ID") @PathVariable Long skillId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        userSkillService.removeUserSkill(currentUser.getId(), skillId);

        ApiResponse<Void> response = ApiResponse.success("Skill removed successfully");

        return ResponseEntity.ok(response);
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
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User updatedUser = userService.updateAvailabilityStatus(currentUser.getId(), status);
        UserResponse userResponse = new UserResponse(updatedUser);

        ApiResponse<UserResponse> response = ApiResponse.success(
                "Availability updated successfully", userResponse);

        return ResponseEntity.ok(response);

    }


//    public Page<User> searchByName(String name, Pageable pageable);

}
