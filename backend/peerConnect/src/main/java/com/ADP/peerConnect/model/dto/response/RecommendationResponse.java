package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Project;
import java.util.Set;
import java.util.stream.Collectors;

public class RecommendationResponse {

    private String userId;
    private Set<ProjectSummaryDTO> recommendedProjects;
    private int totalRecommendations;

    public RecommendationResponse() {
    }

    public RecommendationResponse(String userId, Set<Project> projects) {
        this.userId = userId;
        this.recommendedProjects = projects.stream()
                .map(ProjectSummaryDTO::new)
                .collect(Collectors.toSet());
        this.totalRecommendations = projects.size();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Set<ProjectSummaryDTO> getRecommendedProjects() {
        return recommendedProjects;
    }

    public void setRecommendedProjects(Set<ProjectSummaryDTO> recommendedProjects) {
        this.recommendedProjects = recommendedProjects;
    }

    public int getTotalRecommendations() {
        return totalRecommendations;
    }

    public void setTotalRecommendations(int totalRecommendations) {
        this.totalRecommendations = totalRecommendations;
    }

    // Inner class for project summary
    public static class ProjectSummaryDTO {
        private String id;
        private String title;
        private String description;
        private String status;

        public ProjectSummaryDTO() {
        }

        public ProjectSummaryDTO(Project project) {
            this.id = project.getId();
            this.title = project.getTitle();
            this.description = project.getDescription();
            this.status = project.getStatus() != null ? project.getStatus().toString() : null;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}