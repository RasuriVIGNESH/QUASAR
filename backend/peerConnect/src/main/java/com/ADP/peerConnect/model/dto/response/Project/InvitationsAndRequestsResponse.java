package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.ProjectRoleResponse;
import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.model.enums.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InvitationsAndRequestsResponse {
    private Long id;
    private RequestType requestType;
    private String projectId;
    private String projectTitle;
    private ProjectStatus projectStatus;
    private ProjectRoleResponse projectRole;
    private String initiatedById;
    private String initiatedByName;
    private String targetUserId;
    private String targetUserName;
    private Status status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public InvitationsAndRequestsResponse(InvitationsAndRequests entity) {
        this.id = entity.getId();
        this.requestType = entity.getRequestType();
        this.projectId = entity.getProject().getId();
        this.projectTitle = entity.getProject().getTitle();
        this.projectStatus = entity.getProject().getStatus();
        this.projectRole = entity.getProjectRole() == null
                ? null : ProjectRoleResponse.from(entity.getProjectRole());
        this.initiatedById = entity.getInitiatedBy() == null ? null : entity.getInitiatedBy().getId();
        this.initiatedByName = entity.getInitiatedBy() == null ? null : entity.getInitiatedBy().getFirstName();
        this.targetUserId = entity.getTargetUser().getId();
        this.targetUserName = entity.getTargetUser().getFirstName();
        this.status = entity.getStatus();
        this.message = entity.getMessage();
        this.createdAt = entity.getCreatedAt();
        this.respondedAt = entity.getRespondedAt();
    }
}
