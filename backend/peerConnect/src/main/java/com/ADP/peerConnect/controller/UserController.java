package com.ADP.peerConnect.controller;


import com.ADP.peerConnect.model.dto.request.User.UpdateUser;
import com.ADP.peerConnect.model.dto.response.*;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.UserService;
import com.ADP.peerConnect.service.UserSkillService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for user management operations
 */
@RestController
@RequestMapping(Constants.USER_BASE_PATH)
@Tag(name = "Student Management", description = "Student management APIs")
public class UserController {

        @Autowired
        private UserService userService;
        private final UserSkillService Userskill;

    public UserController(UserSkillService userskill) {
        Userskill = userskill;
    }


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
        @PutMapping("/profile")
        @Operation(summary = "Update user profile", description = "Update current user profile")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
                        @Valid @RequestBody UpdateUser updateRequest,
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
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by various criteria")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserCardResponse>>> searchUsers(
            @Parameter(description = "Search by name") @RequestParam(required = false) String name,
            @Parameter(description = "Filter by branch") @RequestParam(required = false) String branch,
            @Parameter(description = "Filter by graduation year") @RequestParam(required = false) Integer graduationYear,
            @Parameter(description = "Filter by availability status") @RequestParam(required = false) AvailabilityStatus availabilityStatus,
            @Parameter(description = "Filter by skills (comma-separated)") @RequestParam(required = false) List<String> skills,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "firstName") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userService.searchUsers(name, branch, graduationYear,
                availabilityStatus, skills, pageable);

        List<UserCardResponse> userResponses = users.getContent().stream()
                .map(UserCardResponse::new)
                .collect(Collectors.toList());

        PagedResponse<UserCardResponse> pagedResponse = new PagedResponse<>(
                userResponses, users.getNumber(), users.getSize(),
                users.getTotalElements(), users.getTotalPages());

        ApiResponse<PagedResponse<UserCardResponse>> response = ApiResponse.success(
                "Users retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sort")
    @Operation(summary = "Discover users", description = "Discover users with compatibility scoring")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users discovered successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> discoverUsers(
            @Parameter(description = "Filter by skills (comma-separated)") @RequestParam(required = false) List<String> skills,
            @Parameter(description = "Filter by branch") @RequestParam(required = false) String branch,
            @Parameter(description = "Filter by graduation year") @RequestParam(required = false) Integer graduationYear,
            @Parameter(description = "Filter by availability status") @RequestParam(required = false) AvailabilityStatus availabilityStatus,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = Sort.by("firstName").ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Get users excluding current user
        Page<User> users = userService.discoverUsers(currentUser.getId(), branch,
                graduationYear, availabilityStatus, skills, pageable);

        List<UserResponse> userResponses = users.getContent().stream()
                .map(u -> {
                    UserResponse response = new UserResponse(u);
                    return response;
                })
                .collect(Collectors.toList());

        PagedResponse<UserResponse> pagedResponse = new PagedResponse<>(
                userResponses, users.getNumber(), users.getSize(),
                users.getTotalElements(), users.getTotalPages());

        ApiResponse<PagedResponse<UserResponse>> response = ApiResponse.success(
                "Users discovered successfully", pagedResponse);
        return ResponseEntity.ok(response);
    }

}
