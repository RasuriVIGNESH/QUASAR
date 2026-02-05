package com.ADP.peerConnect.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.vladmihalcea.hibernate.type.array.StringArrayType;

@Entity
@Table(name = "project_recommended_candidates", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
@TypeDef(name = "string-array", typeClass = StringArrayType.class)
public class ProjectRecommendedCandidate {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "match_score")
    private Float matchScore;

    @Column(name = "priority")
    private Integer priority;

    // Store missing skills as Postgres text[] column. Mapping to String[] here.
    @Type(type = "string-array")
    @Column(name = "missing_skills", columnDefinition = "text[]")
    private String[] missingSkills;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ProjectRecommendedCandidate() {
        // JPA
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Float getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Float matchScore) {
        this.matchScore = matchScore;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String[] getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String[] missingSkills) {
        this.missingSkills = missingSkills;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
