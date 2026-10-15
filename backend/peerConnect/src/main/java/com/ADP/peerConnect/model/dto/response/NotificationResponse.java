package com.ADP.peerConnect.model.dto.response;
import com.ADP.peerConnect.model.entity.InboxNotification;
import com.ADP.peerConnect.model.enums.NotificationEventType;
import java.time.LocalDateTime;
public record NotificationResponse(String id, NotificationEventType eventType, String title, String message, String relatedProjectId, String relatedUserId, boolean read, LocalDateTime createdAt) {
    public static NotificationResponse from(InboxNotification n) { return new NotificationResponse(n.getId(),n.getEventType(),n.getTitle(),n.getMessage(),n.getRelatedProjectId(),n.getRelatedUserId(),n.getReadAt()!=null,n.getCreatedAt()); }
}
