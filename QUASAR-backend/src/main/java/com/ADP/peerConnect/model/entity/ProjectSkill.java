package com.ADP.peerConnect.model.entity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ProjectSkill entity representing the relationship between Project and Skill
 * FIXED: Removed duplicate 'required' field, kept only 'isRequired'
 */
@Entity
@Table(name = "project_skills", indexes = {
        @Index(name = "idx_project_skill_project", columnList = "project_id"),
        @Index(name = "idx_project_skill_skill", columnList = "skill_id"),
        @Index(name = "idx_project_skill_required", columnList = "is_required")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_skill", columnNames = {"project_id", "skill_id"})
})
public class ProjectSkill {

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
    @JoinColumn(name = "skill_id", nullable = false)
    @NotNull(message = "Skill is required")
    @JsonManagedReference("project-skill")
    private Skill skill;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private com.ADP.peerConnect.model.enums.SkillLevel requiredLevel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public ProjectSkill() {
    }

    public ProjectSkill(Project project, Skill skill, Boolean isRequired) {
        this.project = project;
        this.skill = skill;
        this.isRequired = isRequired;
    }

    // Getters and Setters
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

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public com.ADP.peerConnect.model.enums.SkillLevel getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(com.ADP.peerConnect.model.enums.SkillLevel requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProjectSkill)) return false;
        ProjectSkill that = (ProjectSkill) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ProjectSkill{" +
                "id=" + id +
                ", isRequired=" + isRequired +
                ", requiredLevel=" + requiredLevel +
                '}';
    }
}