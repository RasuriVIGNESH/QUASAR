package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.entity.Notification;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.NotificationType;
import com.ADP.peerConnect.repository.NotificationRepository;
import com.ADP.peerConnect.service.Interface.iNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for Notification entity operations
 */
@Service
@Transactional
public class NotificationService implements iNotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Create a notification
     */
    private Notification createNotification(String userId, String title, String message,
                                         NotificationType type, String relatedEntityId, String relatedEntityType) {
        User user = userService.findById(userId);
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Get user notifications
     */
    public Page<Notification> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get unread notifications
     */
    public Page<Notification> getUnreadNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get notifications by type
     */
    public Page<Notification> getNotificationsByType(String userId, NotificationType type, Pageable pageable) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
    }
    
    /**
     * Get recent unread notifications (last 24 hours)
     */
    public List<Notification> getRecentUnreadNotifications(String userId) {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return notificationRepository.findRecentUnreadNotifications(userId, since);
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        // Verify the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only mark your own notifications as read");
        }
        
        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }
    
    /**
     * Mark all notifications as read
     */
    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }
    
    /**
     * Get unread notification count
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Delete notification
     */
    public void deleteNotification(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        // Verify the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own notifications");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * Delete all notifications for user
     */
    public void deleteAllNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
    }
    
    /**
     * Create project invitation notification
     */
    public void createProjectInvitationNotification(String userId, String projectTitle, String inviterName, String projectId) {
        String title = "Project Invitation";
        String message = String.format("You have been invited to join the project '%s' by %s", projectTitle, inviterName);
        
        createNotification(userId, title, message, NotificationType.PROJECT_INVITATION, projectId, "PROJECT");
    }
    
    /**
     * Create project update notification
     */
    public void createProjectUpdateNotification(String userId, String projectTitle, String updateMessage, String projectId) {
        String title = "Project Update";
        String message = String.format("Update in project '%s': %s", projectTitle, updateMessage);
        
        createNotification(userId, title, message, NotificationType.PROJECT_UPDATE, projectId, "PROJECT");
    }
    
    /**
     * Create team member joined notification
     */
    public void createMemberJoinedNotification(String userId, String memberName, String projectTitle, String projectId) {
        String title = "New Team Member";
        String message = String.format("%s has joined the project '%s'", memberName, projectTitle);
        
        createNotification(userId, title, message, NotificationType.TEAM_UPDATE, projectId, "PROJECT");
    }
    
    /**
     * Create message notification
     */
    public void createMessageNotification(String userId, String senderName, String projectTitle, String messageId) {
        String title = "New Message";
        String message = String.format("You have a new message from %s in project '%s'", senderName, projectTitle);
        
        createNotification(userId, title, message, NotificationType.MESSAGE, messageId, "MESSAGE");
    }
    
    /**
     * Create system notification
     */
    public void createSystemNotification(String userId, String title, String message) {
        createNotification(userId, title, message, NotificationType.SYSTEM, null, null);
    }
    
    /**
     * Clean up old notifications (older than 30 days)
     */
    @Transactional
    public int cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        return notificationRepository.deleteOldNotifications(cutoffDate);
    }
    
    /**
     * Find notification by ID
     */
    public Notification findById(Long notificationId) {
        return notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }
}
