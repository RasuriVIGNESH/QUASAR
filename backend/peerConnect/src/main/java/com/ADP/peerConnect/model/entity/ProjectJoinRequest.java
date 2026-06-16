package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.InvitationStatus;
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
@Setter
@Getter
@Table(name = "project_join_requests", indexes = {
        @Index(name = "idx_join_request_project", columnList = "project_id"),
        @Index(name = "idx_join_request_user", columnList = "user_id"),
        @Index(name = "idx_join_request_status", columnList = "status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_user_join_request", columnNames = {"project_id", "user_id"})
})
public class ProjectJoinRequest {

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
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "Requesting user is required")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "message", columnDefinition = "TEXT")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;


}