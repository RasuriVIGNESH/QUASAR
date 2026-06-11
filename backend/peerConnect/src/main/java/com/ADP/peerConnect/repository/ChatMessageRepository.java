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
import java.util.Optional;

/**
 * Repository interface for ChatMessage entity
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query(
            value = "SELECT cm FROM ChatMessage cm " +
                    "JOIN FETCH cm.sender " +
                    "JOIN FETCH cm.project " +
                    "WHERE cm.project.id = :projectId " +
                    "ORDER BY cm.createdAt DESC",
            countQuery = "SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.project.id = :projectId"
    )
    Page<ChatMessage> findByProjectIdWithSender(
            @Param("projectId") String projectId,
            Pageable pageable
    );

    @Query("SELECT cm FROM ChatMessage cm " +
            "JOIN FETCH cm.sender " +
            "JOIN FETCH cm.project " +
            "WHERE cm.project.id = :projectId AND cm.createdAt >= :since " +
            "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findRecentMessages(
            @Param("projectId") String projectId,
            @Param("since") LocalDateTime since);

    @Query(
            value = "SELECT cm FROM ChatMessage cm " +
                    "JOIN FETCH cm.sender " +
                    "JOIN FETCH cm.project " +
                    "WHERE cm.project.id = :projectId " +
                    "AND LOWER(cm.message) LIKE LOWER(CONCAT('%', :query, '%')) " +
                    "ORDER BY cm.createdAt DESC",
            countQuery = "SELECT COUNT(cm) FROM ChatMessage cm " +
                    "WHERE cm.project.id = :projectId " +
                    "AND LOWER(cm.message) LIKE LOWER(CONCAT('%', :query, '%'))"
    )
    Page<ChatMessage> searchMessagesByContent(
            @Param("projectId") String projectId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT cm FROM ChatMessage cm " +
            "JOIN FETCH cm.sender " +
            "JOIN FETCH cm.project " +
            "WHERE cm.project.id = :projectId AND cm.createdAt > :after " +
            "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findMessagesAfter(
            @Param("projectId") String projectId,
            @Param("after") LocalDateTime after);

    @Query("SELECT cm FROM ChatMessage cm " +
            "JOIN FETCH cm.sender " +
            "JOIN FETCH cm.project " +
            "WHERE cm.id = :id")
    Optional<ChatMessage> findByIdWithAssociations(@Param("id") Long id);


    Page<ChatMessage> findBySenderIdOrderByCreatedAtDesc(String senderId, Pageable pageable);

    long countByProjectId(String projectId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id = :projectId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findLatestMessage(@Param("projectId") String projectId, Pageable pageable);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.project.id IN :projectIds ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByProjectIds(@Param("projectIds") List<String> projectIds, Pageable pageable);
}
