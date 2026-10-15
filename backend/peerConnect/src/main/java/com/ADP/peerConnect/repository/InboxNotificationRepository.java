package com.ADP.peerConnect.repository;
import com.ADP.peerConnect.model.entity.InboxNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface InboxNotificationRepository extends JpaRepository<InboxNotification, String> {
    Page<InboxNotification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);
    long countByRecipientIdAndReadAtIsNull(String recipientId);
    @Modifying @Query("update InboxNotification n set n.readAt = COALESCE(n.readAt, CURRENT_TIMESTAMP) where n.id = :id and n.recipient.id = :recipientId")
    int markRead(@Param("id") String id, @Param("recipientId") String recipientId);
    @Modifying @Query("update InboxNotification n set n.readAt = CURRENT_TIMESTAMP where n.recipient.id = :recipientId and n.readAt is null")
    int markAllRead(@Param("recipientId") String recipientId);
}
