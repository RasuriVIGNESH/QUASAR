package com.ADP.peerConnect.controller.Student;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

@RestController("discover/students")
@RequestMapping("/api")
@Tag(name = "Student Discovery", description = "Find students with matching complementary skills")
public class UserDiscovey {

        @Autowired
        private iUserService userService;

        private int defaultPageSize = 10;
        /**
         * Search users
         */
        @GetMapping("/search/students")
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

        @GetMapping("/all")
        @Operation(summary = "Get all users", description = "Get all users with pagination")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully")
        })
        public ResponseEntity<ApiResponse<PagedResponse<UserCardResponse>>> getAllUsers(
                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "Sort by field") @RequestParam(defaultValue = "firstName") String sortBy,
                        @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

                Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
                                : Sort.by(sortBy).ascending();
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<User> users = userService.findAll(pageable);

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

        @GetMapping("/discover/sort")
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





//        @GetMapping("/users/skills-search")
//        public ResponseEntity<PagedResponse<UserCardResponse>> findBySkillNames(@RequestParam List<String> skillNames) {
//
//                Page<User> users = userService.findBySkillNames(skillNames, PageRequest.of(0, defaultPageSize));
//
//                List<UserCardResponse> content = users.getContent()
//                        .stream()
//                        .map(UserCardResponse::new)
//                        .collect(Collectors.toList());
//
//                PagedResponse<UserCardResponse> response = new PagedResponse<>(
//                        content,
//                        users.getNumber(),
//                        users.getSize(),
//                        users.getTotalElements(),
//                        users.getTotalPages()
//                );
//
//                return ResponseEntity.ok(response);
//        }



}
