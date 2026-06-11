package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.model.enums.MessageType;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    private Long id;
    private String message;
    private MessageType messageType;

    // ✅ SAFE FIELDS
    private String projectId;
    private UserResponse sender;

    private LocalDateTime createdAt;

    public ChatMessageResponse() {}

    // ✅ CONSTRUCTOR (aligned with entity)
    public ChatMessageResponse(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.message = chatMessage.getMessage();
        this.messageType = chatMessage.getMessageType();
        this.createdAt = chatMessage.getCreatedAt();

        // ✅ SAFE LAZY ACCESS
        this.projectId = chatMessage.getProject() != null
                ? chatMessage.getProject().getId()
                : null;

        this.sender = chatMessage.getSender() != null
                ? new UserResponse(chatMessage.getSender())
                : null;
    }

    // Getters

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public String getProjectId() {
        return projectId;
    }

    public UserResponse getSender() {
        return sender;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}