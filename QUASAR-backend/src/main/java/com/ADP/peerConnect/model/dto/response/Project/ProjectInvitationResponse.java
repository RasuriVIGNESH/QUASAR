package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectInvitationResponse {
    private Long invitationId;
    private ProjectResponse project;
    private UserResponse invitedUser;
    private UserResponse invitedBy;
    private ProjectRole role;
    private InvitationStatus status;
    private String message;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;

    public ProjectInvitationResponse() {}

    // V-- THIS IS THE FIX --V
    // This constructor now correctly maps the entity to the DTO
    public ProjectInvitationResponse(ProjectInvitation inv) {
        this.invitationId = inv.getInvitationId();
        this.status = inv.getStatus();
        this.message = inv.getMessage();
        this.role = inv.getRole();
        this.invitedAt = inv.getCreatedAt(); // Use createdAt as the invitedAt time
        this.respondedAt = inv.getRespondedAt();

        // Handle nested objects by calling their own constructors
        if (inv.getProject() != null) {
            this.project = new ProjectResponse(inv.getProject());
        }
        if (inv.getInvitedUser() != null) {
            this.invitedUser = new UserResponse(inv.getInvitedUser());
        }
        if (inv.getInvitedBy() != null) {
            this.invitedBy = new UserResponse(inv.getInvitedBy());
        }
    }
    // ^-- END OF FIX --^

    // Getters and Setters below...

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }
    public void setInvitationId(Long invitationId) {
        this.invitationId = invitationId;
    }
    public Long getInvitationId() {
        return invitationId;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public UserResponse getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(UserResponse invitedBy) {
        this.invitedBy = invitedBy;
    }

    public UserResponse getInvitedUser() {
        return invitedUser;
    }

    public void setInvitedUser(UserResponse invitedUser) {
        this.invitedUser = invitedUser;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ProjectResponse getProject() {
        return project;
    }

    public void setProject(ProjectResponse project) {
        this.project = project;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public ProjectRole getRole() {
        return role;
    }

    public void setRole(ProjectRole role) {
        this.role = role;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }
}