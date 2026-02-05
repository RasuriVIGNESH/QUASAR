package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.enums.MessageType;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * Chat message response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {
    
    private String id;
    private String content;
    private MessageType type;
    private UserResponse sender;
    private ProjectResponse project;
    private LocalDateTime sentAt;
    private Boolean isEdited;
    private LocalDateTime editedAt;
    
    public ChatMessageResponse() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    // Primary content field
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }

    // Alias for some frontends that expect 'message' key instead of 'content'
    @JsonProperty("message")
    public String getMessage() {
        return this.content;
    }

    @JsonProperty("message")
    public void setMessage(String message) {
        this.content = message;
    }

    public MessageType getType() {
        return type;
    }
    
    public void setType(MessageType type) {
        this.type = type;
    }
    
    public UserResponse getSender() {
        return sender;
    }
    
    public void setSender(UserResponse sender) {
        this.sender = sender;
    }
    
    public ProjectResponse getProject() {
        return project;
    }
    
    public void setProject(ProjectResponse project) {
        this.project = project;
    }
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    public Boolean getIsEdited() {
        return isEdited;
    }
    
    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }
    
    public LocalDateTime getEditedAt() {
        return editedAt;
    }
    
    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }
}
