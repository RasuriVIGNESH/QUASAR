package com.ADP.peerConnect.model.dto;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class ProjectRecommendationDTO {

    @NotBlank(message = "Project ID is required")
    private String projectId;  // Changed from Long to String

    @NotNull(message = "Priority is required")
    @Min(value = 1, message = "Priority must be between 1 and 100")
    @Max(value = 100, message = "Priority must be between 1 and 100")
    private Integer priority = 50; // Default priority

    public ProjectRecommendationDTO() {
    }

    public ProjectRecommendationDTO(String projectId, Integer priority) {
        this.projectId = projectId;
        this.priority = priority;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}