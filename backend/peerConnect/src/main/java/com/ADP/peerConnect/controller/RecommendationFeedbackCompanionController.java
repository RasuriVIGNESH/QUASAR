package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.request.RecommendationFeedbackRequest;
import com.ADP.peerConnect.model.dto.response.RecommendationFeedbackResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.RecommendationFeedbackCompanionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendation-feedback")
public class RecommendationFeedbackCompanionController {
    private final RecommendationFeedbackCompanionService service;

    @PostMapping("/projects/{projectId}")
    public ResponseEntity<RecommendationFeedbackResponse> project(
            @PathVariable String projectId,
            @Valid @RequestBody RecommendationFeedbackRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.saveProjectFeedback(principal.getId(), projectId, request.action()));
    }

    @PostMapping("/projects/{projectId}/candidates/{candidateUserId}")
    public ResponseEntity<RecommendationFeedbackResponse> candidate(
            @PathVariable String projectId,
            @PathVariable String candidateUserId,
            @Valid @RequestBody RecommendationFeedbackRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.saveCandidateFeedback(
                principal.getId(), projectId, candidateUserId, request.action()));
    }

    @GetMapping("/saved/projects")
    public ResponseEntity<Page<RecommendationFeedbackResponse>> savedProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getSavedProjects(principal.getId(), page, size));
    }

    @GetMapping("/saved/projects/{projectId}/candidates")
    public ResponseEntity<Page<RecommendationFeedbackResponse>> savedCandidates(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getSavedCandidates(principal.getId(), projectId, page, size));
    }
}
