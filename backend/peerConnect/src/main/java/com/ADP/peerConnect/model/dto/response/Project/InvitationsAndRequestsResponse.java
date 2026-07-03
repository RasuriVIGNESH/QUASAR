package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.model.enums.RequestType;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class InvitationsAndRequestsResponse {

    private  Long id;
    private  RequestType requestType;
    private  String projectId;
    private  String projectTitle;
    private  String initiatedById;
    private  String initiatedByName;
    private  String targetUserId;
    private  String targetUserName;
    private  Status status;
    private  String message;
    private  LocalDateTime createdAt;
    private  LocalDateTime respondedAt;

    public InvitationsAndRequestsResponse(InvitationsAndRequests entity) {
        this.id = entity.getId();
        this.requestType = entity.getRequestType();
        this.projectId = entity.getProject().getId();
        this.projectTitle = entity.getProject().getTitle();
        this.initiatedById = entity.getInitiatedBy() != null ? entity.getInitiatedBy().getId() : null;
        this.initiatedByName = entity.getInitiatedBy() != null ? entity.getInitiatedBy().getFirstName() : null;
        this.targetUserId = entity.getTargetUser().getId();
        this.targetUserName = entity.getTargetUser().getFirstName();
        this.status = entity.getStatus();
        this.message = entity.getMessage();
        this.createdAt = entity.getCreatedAt();
        this.respondedAt = entity.getRespondedAt();
    }

}