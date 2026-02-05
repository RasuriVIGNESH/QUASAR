package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.model.enums.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ChatMessage entity
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Find messages by project ID
     */
    Page<ChatMessage> findByProjectIdOrderByCreatedAtDesc(String projectId, Pageable pageable);
    
    /**
     * Find messages by project ID and type
     */
    Page<ChatMessage> findByProjectIdAndMessageTypeOrderByCreatedAtDesc(String projectId, MessageType type, Pageable pageable);
    
    /**
     * Find messages by sender
     */
    Page<ChatMessage> findBySenderIdOrderByCreatedAtDesc(String senderId, Pageable pageable);
    
    /**
     * Find recent messages in project
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id = :projectId AND cm.createdAt >= :since ORDER BY cm.createdAt DESC")
    List<ChatMessage> findRecentMessages(@Param("projectId") String projectId, @Param("since") LocalDateTime since);
    
    /**
     * Search messages by content
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id = :projectId AND LOWER(cm.message) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY cm.createdAt DESC")
    Page<ChatMessage> searchMessagesByContent(@Param("projectId") String projectId, @Param("query") String query, Pageable pageable);
    
    /**
     * Count messages in project
     */
    long countByProjectId(String projectId);
    
    /**
     * Count messages by sender
     */
    long countBySenderId(String senderId);
    
    /**
     * Find messages sent after a specific time
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id = :projectId AND cm.createdAt > :after ORDER BY cm.createdAt ASC")
    List<ChatMessage> findMessagesAfter(@Param("projectId") String projectId, @Param("after") LocalDateTime after);
    
    /**
     * Find latest message in project
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id = :projectId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findLatestMessage(@Param("projectId") String projectId, Pageable pageable);
    
    /**
     * Delete messages by project ID
     */
    void deleteByProjectId(String projectId);
    
    /**
     * Find messages by multiple projects
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id IN :projectIds ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByProjectIds(@Param("projectIds") List<String> projectIds, Pageable pageable);
}
