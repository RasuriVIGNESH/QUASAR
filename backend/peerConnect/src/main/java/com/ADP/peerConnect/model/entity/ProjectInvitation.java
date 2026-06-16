package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;


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


    public ProjectInvitation(Project project, User invitedBy, User invitedUser, String message) {
        this.project = project;
        this.invitedBy = invitedBy;
        this.invitedUser = invitedUser;
        this.message = message;
    }

        public Long getInvitationId() {
        return id;
    }

    public boolean isPending() {
        return status == InvitationStatus.PENDING;
    }
        public void accept() {
        setStatus(InvitationStatus.ACCEPTED);
    }
        public void reject() {
        setStatus(InvitationStatus.REJECTED);
    }
}