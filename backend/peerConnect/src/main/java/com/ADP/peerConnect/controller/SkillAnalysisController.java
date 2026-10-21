package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.ProjectSkillAnalysisResponse;
import com.ADP.peerConnect.model.dto.response.SkillDemandResponse;
import com.ADP.peerConnect.model.dto.response.StudentSkillAnalysisResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.SkillInsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
@Tag(name = "Skill Insights", description = "Student, project-team, and platform skill analysis")
public class SkillAnalysisController {
    private static final int MAX_PAGE_SIZE = 100;

    private final SkillInsightsService skillInsightsService;

    public SkillAnalysisController(SkillInsightsService skillInsightsService) {
        this.skillInsightsService = skillInsightsService;
    }

    @GetMapping("/skills/analysis/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Analyze the current student's skills and project demand")
    public ResponseEntity<ApiResponse<StudentSkillAnalysisResponse>> getMySkillAnalysis(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Skill analysis retrieved successfully",
                skillInsightsService.getStudentAnalysis(currentUser.getId())));
    }

    @GetMapping("/projects/{projectId}/skills/analysis")
    @Operation(summary = "Analyze skill coverage across the current project team")
    public ResponseEntity<ApiResponse<ProjectSkillAnalysisResponse>> getProjectSkillAnalysis(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Project skill analysis retrieved successfully",
                skillInsightsService.getProjectAnalysis(projectId, currentUser.getId())));
    }

    @GetMapping("/skills/demand")
    @Operation(summary = "Browse skills requested by active projects")
    public ResponseEntity<ApiResponse<PagedResponse<SkillDemandResponse>>> getSkillDemand(
            @RequestParam(required = false) @Size(max = 50) String category,
            @RequestParam(required = false, name = "q") @Size(max = 100) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size) {
        Page<SkillDemandResponse> demand = skillInsightsService.getDemand(
                category, search, PageRequest.of(page, size));
        PagedResponse<SkillDemandResponse> response = new PagedResponse<>(
                demand.getContent(), demand.getNumber(), demand.getSize(),
                demand.getTotalElements(), demand.getTotalPages());
        response.setFirst(demand.isFirst());
        response.setLast(demand.isLast());
        response.setNumberOfElements(demand.getNumberOfElements());
        return ResponseEntity.ok(ApiResponse.success("Skill demand retrieved successfully", response));
    }
}
