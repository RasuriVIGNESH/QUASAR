package com.ADP.peerConnect.model.entity;

import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "user_recommended_projects",
        indexes = {
                @Index(name = "idx_user_recommendation", columnList = "user_id"),
                @Index(name = "idx_project_recommendation", columnList = "project_id"),
                @Index(name = "idx_priority", columnList = "priority"),
                @Index(name = "idx_user_priority", columnList = "user_id, priority")
        }
)
public class UserRecommendedProject implements Serializable {

    @EmbeddedId
    private UserRecommendedProjectId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId")
    @JoinColumn(name = "project_id")
    private Project project;

    @Min(1)
    @Max(100)
    @Column(name = "priority", nullable = false)
    private Integer priority = 50; // Default priority


    private Integer match_score;

//    @CreationTimestamp
//    @Column(name = "recommended_at", nullable = false, updatable = false)
//    private LocalDateTime recommendedAt;

    public UserRecommendedProject() {
    }

    public UserRecommendedProject(User user, Project project, Integer priority) {
        this.user = user;
        this.project = project;
        this.priority = priority;
        this.id = new UserRecommendedProjectId(user.getId(), project.getId());
    }

    public UserRecommendedProjectId getId() {
        return id;
    }

    public void setId(UserRecommendedProjectId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
    public Integer getMatch_score() {
        return match_score;
    }
    public void setMatch_score(Integer match_score) {
        this.match_score = match_score;
    }

//    public LocalDateTime getRecommendedAt() {
//        return recommendedAt;
//    }
//
//    public void setRecommendedAt(LocalDateTime recommendedAt) {
//        this.recommendedAt = recommendedAt;
//    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRecommendedProject that = (UserRecommendedProject) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}