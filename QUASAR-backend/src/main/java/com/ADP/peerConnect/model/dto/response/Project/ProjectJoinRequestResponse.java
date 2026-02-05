package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.ProjectJoinRequest;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import java.time.LocalDateTime;

public class ProjectJoinRequestResponse {

    private ProjectResponse project;
    private UserResponse user;
    private InvitationStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public ProjectJoinRequestResponse() {}

    // Constructor to map from the entity
    public ProjectJoinRequestResponse(ProjectJoinRequest joinRequest) {
        this.project = new ProjectResponse(joinRequest.getProject());
        this.user = new UserResponse(joinRequest.getUser());
        this.status = joinRequest.getStatus();
        this.message = joinRequest.getMessage();
        this.createdAt = joinRequest.getCreatedAt();
        this.respondedAt = joinRequest.getRespondedAt();
    }

    // Getters and Setters

    public ProjectResponse getProject() { return project; }
    public void setProject(ProjectResponse project) { this.project = project; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}