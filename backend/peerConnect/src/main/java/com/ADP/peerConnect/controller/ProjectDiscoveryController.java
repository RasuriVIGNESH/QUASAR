package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.ProjectDiscoverableDetailResponse;
import com.ADP.peerConnect.service.ProjectDiscoveryService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/discovery/projects")
public class ProjectDiscoveryController {
    private final ProjectDiscoveryService projectDiscoveryService;

    public ProjectDiscoveryController(ProjectDiscoveryService projectDiscoveryService) {
        this.projectDiscoveryService = projectDiscoveryService;
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get public project information before requesting to join")
    public ResponseEntity<ProjectDiscoverableDetailResponse> getProjectDetails(@PathVariable String projectId) {
        return ResponseEntity.ok(projectDiscoveryService.getDiscoverableDetails(projectId));
    }
}
