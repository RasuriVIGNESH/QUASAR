package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.MessageType;

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
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_message_project", columnList = "project_id"),
        @Index(name = "idx_chat_message_sender", columnList = "sender_id"),
        @Index(name = "idx_chat_message_type", columnList = "message_type"),
        @Index(name = "idx_chat_message_created", columnList = "created_at"),
        @Index(name = "idx_chat_project_created", columnList = "project_id, created_at")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chat_message_seq")
    @SequenceGenerator(name = "chat_message_seq", sequenceName = "chat_message_seq", allocationSize = 1)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @NotNull(message = "Sender is required")
    private User sender;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Message content is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType = MessageType.TEXT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}