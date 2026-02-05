package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface iChatService {
    ChatMessage sendMessage(String projectId, String senderId, String content);
    ChatMessage editMessage(Long messageId, String userId, String newContent);
    void deleteMessage(Long messageId, String userId);
    Page<ChatMessage> getProjectMessages(String projectId, String userId, Pageable pageable);
    List<ChatMessage> getRecentMessages(String projectId, String userId);
    Page<ChatMessage> searchMessages(String projectId, String query, String userId, Pageable pageable);
    List<ChatMessage> getMessagesAfter(String projectId, LocalDateTime after, String userId);
    ChatMessage getLatestMessage(String projectId, String userId);
    long getMessageCount(String projectId, String userId);
    ChatMessage findById(Long messageId);

    ChatMessage sendSystemMessage(String projectId, String content);
    Page<ChatMessage> getUserMessages(String userId, Pageable pageable);
    Page<ChatMessage> getMessagesFromProjects(List<String> projectIds, Pageable pageable);
}
