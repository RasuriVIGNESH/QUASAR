package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.ProjectRole;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * ProjectMember entity representing the relationship between Project and User (team members)
 * FIXED: Removed incorrect "extends User" inheritance
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "project_members", indexes = {
        @Index(name = "idx_project_member_project", columnList = "project_id"),
        @Index(name = "idx_project_member_user", columnList = "user_id"),
        @Index(name = "idx_project_member_role", columnList = "role")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_member", columnNames = {"project_id", "user_id"})
})
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @NotNull
    private ProjectRole role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ProjectMember(Project project, User user, ProjectRole role) {
        this.project = project;
        this.user = user;
        this.role = role;
    }


    public boolean isLead() {
        return role == ProjectRole.LEAD;
    }

    public boolean isMember() {
        return role == ProjectRole.MEMBER;
    }

    public Object getJoinedAt() {
        return createdAt;
    }
    public ProjectRole getProjectRole() {
        return role;
    }
}