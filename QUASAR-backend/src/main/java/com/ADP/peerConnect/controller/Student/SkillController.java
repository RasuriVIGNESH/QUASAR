package com.ADP.peerConnect.controller.Student;

import com.ADP.peerConnect.model.dto.request.User.AddUserSkillRequest;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkillsRequest;
import com.ADP.peerConnect.model.dto.request.User.UpdateUserSkillRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.SkillResponse;
import com.ADP.peerConnect.model.dto.response.UserSkillResponse;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iSkillService;
import com.ADP.peerConnect.service.Interface.iUserSkillService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for skill management operations
 */
@RestController
@RequestMapping(Constants.SKILL_BASE_PATH)
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Skill Management", description = "Skill management APIs")
public class SkillController {

    @Autowired
    private iSkillService skillService;

    @Autowired
    private iUserSkillService userSkillService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Get all skills with pagination
     */
    @GetMapping
    @Operation(summary = "Get all skills", description = "Get all skills with pagination")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> getAllSkills(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Skill> skills = skillService.findAll(pageable);

        List<SkillResponse> skillResponses = skills.getContent().stream()
                .map(skill -> modelMapper.map(skill, SkillResponse.class))
                .collect(Collectors.toList());

        PagedResponse<SkillResponse> pagedResponse = new PagedResponse<>(
                skillResponses, skills.getNumber(), skills.getSize(),
                skills.getTotalElements(), skills.getTotalPages());

        ApiResponse<PagedResponse<SkillResponse>> response = ApiResponse.success(
                "Skills retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Search skills by name
     */
    @GetMapping("/search")
    @Operation(summary = "Search skills", description = "Search skills by name with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> searchSkills(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Skill> skills = skillService.searchByName(query, pageable);

        List<SkillResponse> skillResponses = skills.getContent().stream()
                .map(skill -> modelMapper.map(skill, SkillResponse.class))
                .collect(Collectors.toList());

        PagedResponse<SkillResponse> pagedResponse = new PagedResponse<>(
                skillResponses, skills.getNumber(), skills.getSize(),
                skills.getTotalElements(), skills.getTotalPages());

        return ResponseEntity.ok(ApiResponse.success("Skills searched successfully", pagedResponse));
    }

    /**
     * Get all skill categories
     */
    @GetMapping("/categories")
    @Operation(summary = "Get skill categories", description = "Get a list of all unique skill categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = skillService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get skills by category
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Get skills by category", description = "Get skills filtered by category with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> getSkillsByCategory(
            @Parameter(description = "Category name") @PathVariable String category,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Skill> skills = skillService.findByCategory(category, pageable);

        List<SkillResponse> skillResponses = skills.getContent().stream()
                .map(skill -> modelMapper.map(skill, SkillResponse.class))
                .collect(Collectors.toList());

        PagedResponse<SkillResponse> pagedResponse = new PagedResponse<>(
                skillResponses, skills.getNumber(), skills.getSize(),
                skills.getTotalElements(), skills.getTotalPages());

        return ResponseEntity.ok(ApiResponse.success("Skills by category retrieved successfully", pagedResponse));
    }

    /**
     * Get predefined skills
     */
    @GetMapping("/predefined")
    @Operation(summary = "Get predefined skills", description = "Get all predefined skills")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Predefined skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Map<String, String>>> getPredefinedSkills() {
        Map<String, String> skills = Constants.PREDEFINED_SKILLS_MAP;
        ApiResponse<Map<String, String>> response = ApiResponse.success(
                "Predefined skills retrieved successfully", skills);

        return ResponseEntity.ok(response);
    }

    /**
     * Add skill to current user
     */
    @PostMapping
    @Operation(summary = "Add user skill", description = "Add a skill to current user profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Skill added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Skill already exists for user")
    })
    public ResponseEntity<ApiResponse<UserSkillResponse>> addUserSkill(
            @Valid @RequestBody AddUserSkillRequest skillRequest,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        UserSkill userSkill = userSkillService.addUserSkill(
                currentUser.getId(), skillRequest.getSkillName(),
                skillRequest.getLevel(), skillRequest.getExperience(), skillRequest.getCategory());

        UserSkillResponse skillResponse = new UserSkillResponse(userSkill);

        ApiResponse<UserSkillResponse> response = ApiResponse.success(
                "Skill added successfully", skillResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Add multiple skills to current user in batch
     */
    @PostMapping("/batch")
    @Operation(summary = "Add multiple user skills", description = "Add multiple skills to current user profile in a single request")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Skills added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<ApiResponse<List<UserSkillResponse>>> addUserSkillsBatch(
            @Valid @RequestBody AddUserSkillsRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        List<UserSkill> added = userSkillService.addUserSkills(currentUser.getId(), request.getSkills());

        List<UserSkillResponse> responses = added.stream()
                .map(UserSkillResponse::new)
                .collect(Collectors.toList());

        ApiResponse<List<UserSkillResponse>> response = ApiResponse.success("Skills added successfully",
                responses);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    /**
     * Remove skill from current user
     */
    @DeleteMapping("/{skillId}")
    @Operation(summary = "Remove user skill", description = "Remove a skill from current user profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill removed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<ApiResponse<Void>> removeUserSkill(
            @Parameter(description = "User skill ID") @PathVariable Long skillId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        userSkillService.removeUserSkill(currentUser.getId(), skillId);

        ApiResponse<Void> response = ApiResponse.success("Skill removed successfully");

        return ResponseEntity.ok(response);
    }
    @PutMapping("/{skillId}")
    @Operation(summary = "Update user skill", description = "Update a skill for current user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<ApiResponse<UserSkillResponse>> updateUserSkill(
            @PathVariable Long skillId,
            @Valid @RequestBody UpdateUserSkillRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        UserSkill updated = userSkillService.updateUserSkill(
                currentUser.getId(),
                skillId,
                request.getLevel(),
                request.getExperience()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Skill updated successfully", new UserSkillResponse(updated))
        );
    }

}
