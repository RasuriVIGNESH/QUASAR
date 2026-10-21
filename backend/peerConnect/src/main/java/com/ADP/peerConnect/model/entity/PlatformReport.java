package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.ReportReason;
import com.ADP.peerConnect.model.enums.ReportStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "platform_reports",
        indexes = { @Index(name = "idx_report_status_created", columnList = "status,created_at"),
                    @Index(name = "idx_report_project", columnList = "reported_project_id"),
                    @Index(name = "idx_report_user", columnList = "reported_user_id") })
public class PlatformReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_project_id")
    private Project reportedProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 40)
    private ReportReason reason;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private ReportStatus status = ReportStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "moderation_note", length = 2000)
    private String moderationNote;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    public PlatformReport(User reporter, Project project, User user, ReportReason reason, String description) {
        this.reporter=reporter; this.reportedProject=project; this.reportedUser=user; this.reason=reason; this.description=description;
    }
}
