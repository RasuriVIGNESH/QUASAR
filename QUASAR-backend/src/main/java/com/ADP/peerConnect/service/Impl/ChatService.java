package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.MessageType;
import com.ADP.peerConnect.repository.ChatMessageRepository;
import com.ADP.peerConnect.service.Interface.iChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for Chat message operations
 */
@Service
@Transactional
public class ChatService implements iChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Send message to project chat
     */
    public ChatMessage sendMessage(String projectId, String senderId, String content) {
        // Validate input
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty");
        }
        
        // Check if project exists
        Project project = projectService.findById(projectId);
        
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, senderId)) {
            throw new UnauthorizedException("You must be a project member to send messages");
        }
        
        // Get sender
        User sender = userService.findById(senderId);
        
        // Create message
        ChatMessage message = new ChatMessage();
        message.setProject(project);
        message.setSender(sender);
        message.setMessage(content.trim());
        message.setMessageType(MessageType.TEXT);
        message.setCreatedAt(LocalDateTime.now());
        
        return chatMessageRepository.save(message);
    }
    
    /**
     * Edit message
     */
    public ChatMessage editMessage(Long messageId, String userId, String newContent) {
        // Validate input
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty");
        }
        
        ChatMessage message = findById(messageId);
        
        // Check if user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }
        
        // Update message
        message.setMessage(newContent.trim());
        
        return chatMessageRepository.save(message);
    }
    
    /**
     * Delete message
     */
    public void deleteMessage(Long messageId, String userId) {
        ChatMessage message = findById(messageId);
        
        // Check if user is the sender or project Lead
        boolean isSender = message.getSender().getId().equals(userId);
        boolean isProjectLead = projectService.isProjectLead(message.getProject().getId(), userId);
        
        if (!isSender && !isProjectLead) {
            throw new UnauthorizedException("You can only delete your own messages or if you're the project Lead");
        }
        
        chatMessageRepository.delete(message);
    }
    
    /**
     * Get project messages
     */
    public Page<ChatMessage> getProjectMessages(String projectId, String userId, Pageable pageable) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view messages");
        }
        
        return chatMessageRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable);
    }
    
    /**
     * Get recent messages (last 24 hours)
     */
    public List<ChatMessage> getRecentMessages(String projectId, String userId) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view messages");
        }
        
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return chatMessageRepository.findRecentMessages(projectId, since);
    }
    
    /**
     * Search messages
     */
    public Page<ChatMessage> searchMessages(String projectId, String query, String userId, Pageable pageable) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to search messages");
        }
        
        return chatMessageRepository.searchMessagesByContent(projectId, query, pageable);
    }
    
    /**
     * Get messages after a specific time (for real-time updates)
     */
    public List<ChatMessage> getMessagesAfter(String projectId, LocalDateTime after, String userId) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view messages");
        }
        
        return chatMessageRepository.findMessagesAfter(projectId, after);
    }
    
    /**
     * Get latest message in project
     */
    public ChatMessage getLatestMessage(String projectId, String userId) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view messages");
        }
        
        List<ChatMessage> messages = chatMessageRepository.findLatestMessage(projectId, PageRequest.of(0, 1));
        return messages.isEmpty() ? null : messages.get(0);
    }
    
    /**
     * Get message count for project
     */
    public long getMessageCount(String projectId, String userId) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException("You must be a project member to view message count");
        }
        
        return chatMessageRepository.countByProjectId(projectId);
    }
    
    /**
     * Send system message
     */
    public ChatMessage sendSystemMessage(String projectId, String content) {
        Project project = projectService.findById(projectId);
        
        ChatMessage message = new ChatMessage();
        message.setProject(project);
        message.setSender(null); // System messages have no sender
        message.setMessage(content);
        message.setMessageType(MessageType.SYSTEM);
        message.setCreatedAt(LocalDateTime.now());
        
        return chatMessageRepository.save(message);
    }
    
    /**
     * Find message by ID
     */
    public ChatMessage findById(Long messageId) {
        return chatMessageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
    }
    
    /**
     * Get user's messages across all projects
     */
    public Page<ChatMessage> getUserMessages(String userId, Pageable pageable) {
        return chatMessageRepository.findBySenderIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Get messages from multiple projects (for user's project list)
     */
    public Page<ChatMessage> getMessagesFromProjects(List<String> projectIds, Pageable pageable) {
        return chatMessageRepository.findByProjectIds(projectIds, pageable);
    }
}
