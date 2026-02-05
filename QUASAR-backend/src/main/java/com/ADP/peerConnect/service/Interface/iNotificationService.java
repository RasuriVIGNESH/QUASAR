package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.Notification;
import com.ADP.peerConnect.model.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface iNotificationService {
    public Page<Notification> getUserNotifications(String userId, Pageable pageable) ;
    public Page<Notification> getUnreadNotifications(String userId, Pageable pageable) ;
    public Page<Notification> getNotificationsByType(String userId, NotificationType type, Pageable pageable);
    public List<Notification> getRecentUnreadNotifications(String userId);
    public void markAsRead(Long notificationId, String userId);
    public int markAllAsRead(String userId) ;
    public long getUnreadCount(String userId);
    public void deleteNotification(Long notificationId, String userId);
    public void deleteAllNotifications(String userId) ;
    public Notification findById(Long notificationId);


    public void createProjectInvitationNotification(String userId, String projectTitle, String inviterName, String projectId) ;
    public void createProjectUpdateNotification(String userId, String projectTitle, String updateMessage, String projectId);
    public void createMemberJoinedNotification(String userId, String memberName, String projectTitle, String projectId);
    public void createMessageNotification(String userId, String senderName, String projectTitle, String messageId) ;
    public void createSystemNotification(String userId, String title, String message) ;
    public int cleanupOldNotifications();

}
