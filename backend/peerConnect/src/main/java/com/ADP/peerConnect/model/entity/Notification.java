package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.NotificationType;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter @Getter
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_user", columnList = "user_id"),
        @Index(name = "idx_notification_type", columnList = "type"),
        @Index(name = "idx_notification_read", columnList = "is_read"),
        @Index(name = "idx_notification_created", columnList = "created_at"),
        @Index(name = "idx_notification_entity", columnList = "related_entity_id"),
        @Index(name = "idx_notification_user_read_created", columnList = "user_id, is_read, created_at")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq")
    @SequenceGenerator(name = "notification_seq", sequenceName = "notification_seq", allocationSize = 1)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 100)
    @NotBlank(message = "Notification title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Notification message is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "related_entity_id")
    private String relatedEntityId;

    @Column(name = "related_entity_type", length = 50)
    @Size(max = 50, message = "Related entity type must not exceed 50 characters")
    private String relatedEntityType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;


    public Notification(User user, NotificationType type, String title, String message) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    public Notification(User user, NotificationType type, String title, String message,
                        String relatedEntityId, String relatedEntityType) {
        this(user, type, title, message);
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
    }
}