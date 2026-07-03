package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.model.enums.RequestType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@Table(name = "project_invitations_and_requests", indexes = {
        @Index(name = "idx_iar_project", columnList = "project_id"),
        @Index(name = "idx_iar_initiated_by", columnList = "initiated_by_id"),
        @Index(name = "idx_iar_target_user", columnList = "target_user_id"),
        @Index(name = "idx_iar_status", columnList = "status"),
        @Index(name = "idx_iar_type", columnList = "request_type"),
        @Index(name = "idx_iar_created", columnList = "created_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_target_user", columnNames = {"project_id", "target_user_id"})
})
public class InvitationsAndRequests {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    @JsonBackReference
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, updatable = false)
    @NotNull(message = "Request type is required")
    private RequestType requestType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by_id", nullable = true)
    private User initiatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    @NotNull(message = "Target user is required")
    private User targetUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "message", columnDefinition = "TEXT")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public InvitationsAndRequests createInvitation(Project project, User invitedBy, User invitedUser, String message) {
        InvitationsAndRequests entity = new InvitationsAndRequests();
        entity.setProject(project);
        entity.setRequestType(RequestType.INVITATION);
        entity.setInitiatedBy(invitedBy);
        entity.setTargetUser(invitedUser);
        entity.setMessage(message);
        return entity;
    }
    public InvitationsAndRequests createJoinRequest(Project project, User requestingUser, String message) {
        InvitationsAndRequests entity = new InvitationsAndRequests();
        entity.setProject(project);
        entity.setRequestType(RequestType.JOIN_REQUEST);
        entity.setInitiatedBy(null);
        entity.setTargetUser(requestingUser);
        entity.setMessage(message);
        return entity;
    }

    public Long getInvitationId() {
        return id;
    }

    public boolean isInvitation() {
        return requestType == RequestType.INVITATION;
    }

    public boolean isJoinRequest() {
        return requestType == RequestType.JOIN_REQUEST;
    }

    public boolean isPending() {
        return status == Status.PENDING;
    }

    public void accept() {
        setStatus(Status.ACCEPTED);
        setRespondedAt(LocalDateTime.now());
    }

    public void reject() {
        setStatus(Status.REJECTED);
        setRespondedAt(LocalDateTime.now());
    }
}