package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.ProjectRecommendationDTO;
import com.ADP.peerConnect.model.dto.RecommendationRequestWithPriority;

import com.ADP.peerConnect.model.dto.response.RecommendationResponseWithPriority;
import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import com.ADP.peerConnect.service.Interface.RecommendationServiceWithPriority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationControllerWithPriority {

    private final RecommendationServiceWithPriority recommendationService;

    @Autowired
    public RecommendationControllerWithPriority(RecommendationServiceWithPriority recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * GET /api/recommendations/user/{userId}
     * Get all recommended projects for a user ordered by priority
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<RecommendationResponseWithPriority> getRecommendations(@PathVariable String userId) {
        List<UserRecommendedProject> recommendations = recommendationService.getRecommendedProjectsByPriority(userId);
        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, recommendations);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/recommendations/user/{userId}/top
     * Get top N recommended projects for a user by priority
     */
    @GetMapping("/user/{userId}/top")
    public ResponseEntity<RecommendationResponseWithPriority> getTopRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit) {
        List<UserRecommendedProject> recommendations = recommendationService.getTopRecommendations(userId, limit);
        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, recommendations);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/recommendations/user/{userId}/project
     * Add a single project recommendation with priority
     */
//    @PostMapping("/user/{userId}/project")
//    public ResponseEntity<RecommendationResponseWithPriority> addRecommendation(
//            @PathVariable String userId,
//            @Valid @RequestBody ProjectRecommendationDTO request) {
//        List<UserRecommendedProject> recommendations = recommendationService.addRecommendation(
//                userId,
//                request.getProjectId(),
//                request.getPriority()
//        );
//        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, recommendations);
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    /**
     * POST /api/recommendations/user/{userId}/projects
     * Add multiple project recommendations with priorities
     */
//    @PostMapping("/user/{userId}/projects")
//    public ResponseEntity<RecommendationResponseWithPriority> addMultipleRecommendations(
//            @PathVariable String userId,
//            @Valid @RequestBody List<ProjectRecommendationDTO> recommendations) {
//        List<UserRecommendedProject> result = recommendationService.addMultipleRecommendations(userId, recommendations);
//        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, result);
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    /**
     * PUT /api/recommendations/replace
     * Replace all recommendations for a user (Used by ML API)
     */
//    @PutMapping("/replace")
//    public ResponseEntity<RecommendationResponseWithPriority> replaceRecommendations(
//            @Valid @RequestBody RecommendationRequestWithPriority request) {
//        List<UserRecommendedProject> recommendations = recommendationService.replaceAllRecommendations(
//                request.getUserId(),
//                request.getRecommendations()
//        );
//        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(
//                request.getUserId(),
//                recommendations
//        );
//        return ResponseEntity.ok(response);
//    }

    /**
     * PATCH /api/recommendations/user/{userId}/project/{projectId}/priority
     * Update priority of an existing recommendation
     */
//    @PatchMapping("/user/{userId}/project/{projectId}/priority")
//    public ResponseEntity<UserRecommendedProject> updatePriority(
//            @PathVariable String userId,
//            @PathVariable String projectId,  // Changed to String
//            @RequestParam @Min(1) @Max(100) Integer priority) {
//        UserRecommendedProject recommendation = recommendationService.updateRecommendationPriority(
//                userId,
//                projectId,
//                priority
//        );
//        return ResponseEntity.ok(recommendation);
//    }

    /**
     * DELETE /api/recommendations/user/{userId}/project/{projectId}
     * Remove a project recommendation
     */
//    @DeleteMapping("/user/{userId}/project/{projectId}")
//    public ResponseEntity<Void> removeRecommendation(
//            @PathVariable String userId,
//            @PathVariable String projectId) {  // Changed to String
//        recommendationService.removeRecommendation(userId, projectId);
//        return ResponseEntity.noContent().build();
//    }
//
//    /**
//     * DELETE /api/recommendations/user/{userId}
//     * Clear all recommendations for a user
//     */
//    @DeleteMapping("/user/{userId}")
//    public ResponseEntity<Void> clearAllRecommendations(@PathVariable String userId) {
//        recommendationService.clearAllRecommendations(userId);
//        return ResponseEntity.noContent().build();
//    }
}