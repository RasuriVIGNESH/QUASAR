package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class RecommendationResponse {

    private String userId;
    private Set<ProjectSummaryDTO> recommendedProjects;
    private int totalRecommendations;

    @NoArgsConstructor
    @AllArgsConstructor
    @Setter @Getter
    // Inner class for project summary
    public static class ProjectSummaryDTO {
        private String id;
        private String title;
        private String description;
        private String status;
    }
}