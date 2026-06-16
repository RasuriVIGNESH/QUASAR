package com.ADP.peerConnect.model.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Send message request DTO
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class SendMessageRequest {
    
    @NotBlank(message = "Message content is required")
    @Size(min = 1, max = 2000, message = "Message content must be between 1 and 2000 characters")
    private String content;
}

