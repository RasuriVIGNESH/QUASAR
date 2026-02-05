package com.ADP.peerConnect.controller.discovery;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.SkillResponse;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.service.Interface.iSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController("api/skills/")
public class skillDiscovery {

    @Autowired
    private iSkillService skillService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Find skills by name
     */
    @GetMapping("skills/")
    public ResponseEntity<List<SkillResponse>> findByName(String name ) {
        List<Skill> skills = skillService.findByName(name);
        List<SkillResponse> skillResponses = skills.stream()
                .map(skill -> modelMapper.map(skill, SkillResponse.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(skillResponses);
    }
    /**
     * Search skills by name
     */
    @GetMapping("/search")
    @Operation(summary = "Search skills", description = "Search skills by name")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> searchSkills(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Skill> skills = skillService.searchByName(query, pageable);

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
     * Get skills by category
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Get skills by category", description = "Get skills filtered by category")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> getSkillsByCategory(
            @Parameter(description = "Skill category") @PathVariable String category,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Skill> skills = skillService.findByCategory(category, pageable);

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
     * Get all skill categories
     */
    @GetMapping("api/skills/categories")
    @Operation(summary = "Get skill categories", description = "Get all available skill categories")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<String>>> getSkillCategories() {
        List<String> categories = skillService.getAllCategories();

        ApiResponse<List<String>> response = ApiResponse.success(
                "Categories retrieved successfully", categories);

        return ResponseEntity.ok(response);
    }
}
