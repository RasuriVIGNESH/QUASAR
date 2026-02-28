package com.ADP.peerConnect.controller.discovery;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
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

import java.util.List;
import java.util.stream.Collectors;


@RestController("discover/users")
public class UserDiscovey {

    @Autowired
    private iUserService userService;


    /**
     * Search users
     */
    @GetMapping("/search/users")
    @Operation(summary = "Search users", description = "Search users by various criteria")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> searchUsers(
            @Parameter(description = "Search by name") @RequestParam(required = false) String name,
            @Parameter(description = "Filter by branch") @RequestParam(required = false) String branch,
            @Parameter(description = "Filter by graduation year") @RequestParam(required = false) Integer graduationYear,
            @Parameter(description = "Filter by availability status") @RequestParam(required = false) AvailabilityStatus availabilityStatus,
            @Parameter(description = "Filter by skills (comma-separated)") @RequestParam(required = false) List<String> skills,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "firstName") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userService.searchUsers(name, branch, graduationYear,
                availabilityStatus, skills, pageable);

        List<UserResponse> userResponses = users.getContent().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());

        PagedResponse<UserResponse> pagedResponse = new PagedResponse<>(
                userResponses, users.getNumber(), users.getSize(),
                users.getTotalElements(), users.getTotalPages());

        ApiResponse<PagedResponse<UserResponse>> response = ApiResponse.success(
                "Users retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all users", description = "Get all users with pagination")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "firstName") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userService.findAll(pageable);

        List<UserResponse> userResponses = users.getContent().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());

        PagedResponse<UserResponse> pagedResponse = new PagedResponse<>(
                userResponses, users.getNumber(), users.getSize(),
                users.getTotalElements(), users.getTotalPages());

        ApiResponse<PagedResponse<UserResponse>> response = ApiResponse.success(
                "Users retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }

    @GetMapping("api/discover/sort")
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

    @GetMapping("/{branch}")
    public ResponseEntity<ApiResponse<Page<User>>> findUsersByBranch(@PathVariable String branch) {
        ApiResponse<Page<User>> response = ApiResponse.success(
                "Users retrieved successfully", userService.findByBranch(branch, Pageable.unpaged())
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/year/{graduationYear}")
    public ResponseEntity<Page<User>> findUsersByBranch(@PathVariable Integer graduationYear) {
        return new ResponseEntity<>(userService.findByGraduationYear(graduationYear, Pageable.unpaged()), HttpStatus.OK);
    }

    @GetMapping("/skills")
    @Operation(summary = "Find users by skill names", description = "Retrieve users who possess any of the specified skills")
    public ResponseEntity<Page<User>> findBySkillNames(@RequestParam List<String> Skillname) {
        return new ResponseEntity<>(userService.findBySkillNames(Skillname, Pageable.unpaged()), HttpStatus.OK);
    }

    @GetMapping("/available-with-skills/{excludeUserId}")
    public ResponseEntity<Page<User>> findAvailableUsersWithSkills(@RequestParam List<String> skillNames, @RequestParam String excludeUserId) {
        return new ResponseEntity<>(userService.findAvailableUsersWithSkills(skillNames, excludeUserId, Pageable.unpaged()), HttpStatus.OK);
    }

    @GetMapping("/availability/{status}")
    public ResponseEntity<Page<User>> findByAvailabilityStatus(@RequestParam AvailabilityStatus status) {
        return new ResponseEntity<>(userService.findByAvailabilityStatus(status, Pageable.unpaged()), HttpStatus.OK);
    }
}
