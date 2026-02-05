package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class RecommendationResponseWithPriority {

    private String userId;
    private List<ProjectRecommendationDetailDTO> recommendedProjects;
    private int totalRecommendations;

    public RecommendationResponseWithPriority() {
    }

    public RecommendationResponseWithPriority(String userId, List<UserRecommendedProject> recommendations) {
        this.userId = userId;
        this.recommendedProjects = recommendations.stream()
                .map(ProjectRecommendationDetailDTO::new)
                .collect(Collectors.toList());
        this.totalRecommendations = recommendations.size();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<ProjectRecommendationDetailDTO> getRecommendedProjects() {
        return recommendedProjects;
    }

    public void setRecommendedProjects(List<ProjectRecommendationDetailDTO> recommendedProjects) {
        this.recommendedProjects = recommendedProjects;
    }

    public int getTotalRecommendations() {
        return totalRecommendations;
    }

    public void setTotalRecommendations(int totalRecommendations) {
        this.totalRecommendations = totalRecommendations;
    }

    // Inner class for project recommendation details
    public static class ProjectRecommendationDetailDTO {
        private String projectId;  // Changed from Long to String
        private String title;
        private String description;
        private String status;
        private Integer priority;
        private LocalDateTime recommendedAt;

        public ProjectRecommendationDetailDTO() {
        }

        public ProjectRecommendationDetailDTO(UserRecommendedProject recommendation) {
            Project project = recommendation.getProject();
            this.projectId = project.getId();
            this.title = project.getTitle();
            this.description = project.getDescription();
            this.status = project.getStatus() != null ? project.getStatus().toString() : null;
            this.priority = recommendation.getPriority();
//            this.recommendedAt = recommendation.getRecommendedAt();
        }

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
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

        public Integer getPriority() {
            return priority;
        }

        public void setPriority(Integer priority) {
            this.priority = priority;
        }

        public LocalDateTime getRecommendedAt() {
            return recommendedAt;
        }

        public void setRecommendedAt(LocalDateTime recommendedAt) {
            this.recommendedAt = recommendedAt;
        }
    }
}