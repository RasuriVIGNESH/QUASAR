package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Notification response DTO
 */

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
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

}

