package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Notification response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private String relatedEntityId;
    private String relatedEntityType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    public NotificationResponse() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public String getRelatedEntityId() {
        return relatedEntityId;
    }
    
    public void setRelatedEntityId(String relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
    
    public String getRelatedEntityType() {
        return relatedEntityType;
    }
    
    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getReadAt() {
        return readAt;
    }
    
    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}

