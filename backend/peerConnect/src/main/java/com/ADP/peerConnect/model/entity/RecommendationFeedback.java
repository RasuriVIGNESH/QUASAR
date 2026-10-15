package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.FeedbackAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "recommendation_feedback",
        indexes = { @Index(name = "idx_feedback_actor_created", columnList = "actor_id,created_at"),
                    @Index(name = "idx_feedback_project", columnList = "project_id"),
                    @Index(name = "idx_feedback_candidate", columnList = "candidate_user_id") })
public class RecommendationFeedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "actor_id", nullable = false)
    private User actor;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "candidate_user_id")
    private User candidateUser;
    @Enumerated(EnumType.STRING) @Column(name = "action", nullable = false, length = 32)
    private FeedbackAction action;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    public RecommendationFeedback(User actor, Project project, User candidateUser, FeedbackAction action) {
        this.actor = actor; this.project = project; this.candidateUser = candidateUser; this.action = action;
    }
}
