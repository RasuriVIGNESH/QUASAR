package com.ADP.peerConnect.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
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

    public UserRecommendedProject(User user, Project project, Integer priority) {
        this.user = user;
        this.project = project;
        this.priority = priority;
        this.id = new UserRecommendedProjectId(user.getId(), project.getId());
    }


}