package com.ADP.peerConnect.model.dto.request;

import javax.validation.constraints.NotNull;

public class SingleRecommendationRequest {

    @NotNull(message = "Project ID is required")
    private String projectId;

    public SingleRecommendationRequest() {
    }

    public SingleRecommendationRequest(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}