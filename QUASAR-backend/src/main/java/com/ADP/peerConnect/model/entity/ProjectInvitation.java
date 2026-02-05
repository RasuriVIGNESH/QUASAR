package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_invitations", indexes = {
        @Index(name = "idx_invitation_project", columnList = "project_id"),
        @Index(name = "idx_invitation_sender", columnList = "invited_by_id"),
        @Index(name = "idx_invitation_receiver", columnList = "invited_user_id"),
        @Index(name = "idx_invitation_status", columnList = "status"),
        @Index(name = "idx_invitation_created", columnList = "created_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_invitation", columnNames = {"project_id", "invited_user_id"})
})
public class ProjectInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    @NotNull(message = "Inviter is required")
    private User invitedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id", nullable = false)
    @NotNull(message = "Invited user is required")
    private User invitedUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "message", columnDefinition = "TEXT")
    @Size(max = 500, message = "Invitation message must not exceed 500 characters")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ProjectRole role;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;

    public ProjectInvitation() {
    }

    public ProjectInvitation(Project project, User invitedBy, User invitedUser, String message) {
        this.project = project;
        this.invitedBy = invitedBy;
        this.invitedUser = invitedUser;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(User invitedBy) {
        this.invitedBy = invitedBy;
    }

    public User getInvitedUser() {
        return invitedUser;
    }

    public void setInvitedUser(User invitedUser) {
        this.invitedUser = invitedUser;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
        if (status != InvitationStatus.PENDING && this.respondedAt == null) {
            this.respondedAt = LocalDateTime.now();
        }
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public boolean isPending() {
        return status == InvitationStatus.PENDING;
    }

    public boolean isAccepted() {
        return status == InvitationStatus.ACCEPTED;
    }

    public boolean isRejected() {
        return status == InvitationStatus.REJECTED;
    }

    public void accept() {
        setStatus(InvitationStatus.ACCEPTED);
    }

    public void reject() {
        setStatus(InvitationStatus.REJECTED);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProjectInvitation)) return false;
        ProjectInvitation that = (ProjectInvitation) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ProjectInvitation{" +
                "id=" + id +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", respondedAt=" + respondedAt +
                '}';
    }

    public Long getInvitationId() {
        return id;
    }

    public void setInvitationId(Long id) {
        this.id = id;
    }
}