package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.NotificationEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "inbox_notifications",
        indexes = { @Index(name = "idx_notification_recipient_created", columnList = "recipient_id,created_at"),
                    @Index(name = "idx_notification_recipient_read", columnList = "recipient_id,read_at") })
public class InboxNotification {
    @Id @UuidGenerator @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    @Enumerated(EnumType.STRING) @Column(name = "event_type", nullable = false, length = 40)
    private NotificationEventType eventType;
    @Column(name = "title", nullable = false, length = 160) private String title;
    @Column(name = "message", nullable = false, length = 1000) private String message;
    @Column(name = "related_project_id", length = 36) private String relatedProjectId;
    @Column(name = "related_user_id", length = 36) private String relatedUserId;
    @Column(name = "read_at") private LocalDateTime readAt;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    public InboxNotification(User recipient, NotificationEventType eventType, String title, String message,
                             String relatedProjectId, String relatedUserId) {
        this.recipient=recipient; this.eventType=eventType; this.title=title; this.message=message;
        this.relatedProjectId=relatedProjectId; this.relatedUserId=relatedUserId;
    }
}
