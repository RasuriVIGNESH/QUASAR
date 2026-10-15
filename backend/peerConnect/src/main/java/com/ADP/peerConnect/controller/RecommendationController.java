package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.MemberRecommendationResult;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.ProjectRecommendationResult;
import com.ADP.peerConnect.model.dto.response.ProjectSkillGapResult;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api")
@Tag(name = "Recommendations", description = "Skill-based collaboration recommendations")
public class RecommendationController {

    private static final int MAX_PAGE_SIZE = 50;
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/recommendations/projects")
    @Operation(summary = "Recommend recruiting projects to the current student")
    public ResponseEntity<PagedResponse<ProjectRecommendationResult>> recommendProjects(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        Page<ProjectRecommendationResult> results = recommendationService.recommendProjects(
                currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(toResponse(results));
    }

    @GetMapping("/projects/{projectId}/recommended-members")
    @Operation(summary = "Recommend available students to the project lead")
    public ResponseEntity<PagedResponse<MemberRecommendationResult>> recommendMembers(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        Page<MemberRecommendationResult> results = recommendationService.recommendMembers(
                projectId, currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(toResponse(results));
    }

    @GetMapping("/projects/{projectId}/skill-gaps")
    @Operation(summary = "Show project skill coverage across the current team")
    public ResponseEntity<List<ProjectSkillGapResult>> getProjectSkillGaps(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(recommendationService.getProjectSkillGaps(projectId, currentUser.getId()));
    }

    private <T> PagedResponse<T> toResponse(Page<T> page) {
        PagedResponse<T> response = new PagedResponse<>(page.getContent(), page.getNumber(),
                page.getSize(), page.getTotalElements(), page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setNumberOfElements(page.getNumberOfElements());
        return response;
    }
}
