package com.ADP.peerConnect.model.dto;

import com.ADP.peerConnect.model.dto.ProjectRecommendationDTO;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

public class RecommendationRequestWithPriority {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "At least one project recommendation is required")
    @Valid
    private List<ProjectRecommendationDTO> recommendations;

    public RecommendationRequestWithPriority() {
    }

    public RecommendationRequestWithPriority(String userId, List<ProjectRecommendationDTO> recommendations) {
        this.userId = userId;
        this.recommendations = recommendations;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<ProjectRecommendationDTO> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<ProjectRecommendationDTO> recommendations) {
        this.recommendations = recommendations;
    }
}