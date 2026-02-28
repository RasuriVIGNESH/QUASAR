package com.ADP.peerConnect.controller;


import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.SkillResponse;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.service.Interface.iSkillService;
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
@Tag(name = "Skill Management", description = "Skill management APIs")
public class SkillController {
    
    @Autowired
    private iSkillService skillService;
    
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
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
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
     * Get predefined skills
     */
    @GetMapping("/predefined")
    @Operation(summary = "Get predefined skills", description = "Get all predefined skills")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Predefined skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Map<String,String>>> getPredefinedSkills() {
//        List<Skill> skills = skillService.getPredefinedSkills();

        Map<String,String> skills=Constants.PREDEFINED_SKILLS_MAP;
        ApiResponse< Map<String,String>> response = ApiResponse.success(
            "Predefined skills retrieved successfully", skills);

        return ResponseEntity.ok(response);
    }
    


    /**
     * Get skill by ID
     */
//    @GetMapping("/{skillId}")
//    @Operation(summary = "Get skill by ID", description = "Get skill details by ID")
//    @ApiResponses(value = {
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill retrieved successfully"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found")
//    })
//    public ResponseEntity<ApiResponse<SkillResponse>> getSkillById(
//            @Parameter(description = "Skill ID") @PathVariable Long skillId) {
//
//        Skill skill = skillService.findById(skillId);
//        SkillResponse skillResponse = modelMapper.map(skill, SkillResponse.class);
//
//        ApiResponse<SkillResponse> response = ApiResponse.success(
//            "Skill retrieved successfully", skillResponse);
//
//        return ResponseEntity.ok(response);
//    }

    /**
     * Create a new skill
     */
//    @PostMapping
//    @Operation(summary = "Create skill", description = "Create a new skill")
//    @ApiResponses(value = {
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Skill created successfully"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Skill already exists")
//    })
//    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(
//            @Valid @RequestBody CreateSkillRequest createRequest) {
//
//        Skill skill = skillService.createSkill(createRequest.getName(), createRequest.getCategory());
//        SkillResponse skillResponse = modelMapper.map(skill, SkillResponse.class);
//
//        ApiResponse<SkillResponse> response = ApiResponse.success(
//            "Skill created successfully", skillResponse);
//
//        return new ResponseEntity<>(response, HttpStatus.CREATED);
//    }

    /**
     * Update skill
     */
//    @PutMapping("/{skillId}")
//    @Operation(summary = "Update skill", description = "Update skill information")
//    @ApiResponses(value = {
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill updated successfully"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Skill name already exists")
//    })
//    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(
//            @Parameter(description = "Skill ID") @PathVariable Long skillId,
//            @Valid @RequestBody CreateSkillRequest updateRequest) {
//
//        Skill skill = skillService.updateSkill(skillId, updateRequest.getName(), updateRequest.getCategory());
//        SkillResponse skillResponse = modelMapper.map(skill, SkillResponse.class);
//
//        ApiResponse<SkillResponse> response = ApiResponse.success(
//            "Skill updated successfully", skillResponse);
//
//        return ResponseEntity.ok(response);
//    }
    
    /**
     * Delete skill
     */
//    @DeleteMapping("/{skillId}")
//    @Operation(summary = "Delete skill", description = "Delete a skill (non-predefined only)")
//    @ApiResponses(value = {
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skill deleted successfully"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Skill not found"),
//        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Cannot delete predefined skill")
//    })
//    public ResponseEntity<ApiResponse<Void>> deleteSkill(
//            @Parameter(description = "Skill ID") @PathVariable Long skillId) {
//
//        skillService.deleteSkill(skillId);
//
//        ApiResponse<Void> response = ApiResponse.success("Skill deleted successfully");
//
//        return ResponseEntity.ok(response);
//    }

}
