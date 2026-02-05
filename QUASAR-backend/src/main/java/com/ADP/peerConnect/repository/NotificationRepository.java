package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Notification;
import com.ADP.peerConnect.model.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find notifications by user ID
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Find unread notifications by user ID
     */
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Find notifications by user ID and type
     */
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, NotificationType type, Pageable pageable);
    
    /**
     * Find recent unread notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentUnreadNotifications(@Param("userId") String userId, @Param("since") LocalDateTime since);
    
    /**
     * Count unread notifications for user
     */
    long countByUserIdAndIsReadFalse(String userId);
    
    /**
     * Count notifications by user and type
     */
    long countByUserIdAndType(String userId, NotificationType type);
    
    /**
     * Mark notification as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :notificationId AND n.user.id = :userId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("userId") String userId, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all notifications as read for user
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") String userId, @Param("readAt") LocalDateTime readAt);
    
    /**
     * Delete old notifications
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Find notifications by related entity
     */
    List<Notification> findByRelatedEntityIdAndRelatedEntityType(String relatedEntityId, String relatedEntityType);
    
    /**
     * Delete notifications by user ID
     */
    void deleteByUserId(String userId);
}
