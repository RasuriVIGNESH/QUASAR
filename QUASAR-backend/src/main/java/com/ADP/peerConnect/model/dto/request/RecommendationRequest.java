package com.ADP.peerConnect.model.dto.request;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Set;

public class RecommendationRequest {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "At least one project ID is required")
    private Set<String> projectIds;

    public RecommendationRequest() {
    }

    public RecommendationRequest(String userId, Set<String> projectIds) {
        this.userId = userId;
        this.projectIds = projectIds;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Set<String> getProjectIds() {
        return projectIds;
    }

    public void setProjectIds(Set<String> projectIds) {
        this.projectIds = projectIds;
    }
}