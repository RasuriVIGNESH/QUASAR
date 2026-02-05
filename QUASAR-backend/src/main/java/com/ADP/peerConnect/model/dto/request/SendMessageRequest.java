package com.ADP.peerConnect.model.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * Send message request DTO
 */
public class SendMessageRequest {
    
    @NotBlank(message = "Message content is required")
    @Size(min = 1, max = 2000, message = "Message content must be between 1 and 2000 characters")
    private String content;
    
    public SendMessageRequest() {}
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
}

