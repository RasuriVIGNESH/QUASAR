package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.dto.response.ChatMessageResponse;
import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.repository.ChatMessageRepository;
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
public class ChatService {
    
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
            throw new ForbiddenException("You must be a project member to send messages");
        }
        
        // Get sender
        User sender = userService.findById(senderId);
        
        // Create message
        ChatMessage message = new ChatMessage();
        message.setProject(project);
        message.setSender(sender);
        message.setMessage(content.trim());
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
            throw new ForbiddenException("You can only edit your own messages");
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
            throw new ForbiddenException("You can only delete your own messages or if you're the project Lead");
        }
        
        chatMessageRepository.delete(message);
    }
    
    /**
     * Get project messages
     */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getProjectMessageResponses(
            String projectId,
            String userId,
            Pageable pageable
    ) {
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new ForbiddenException(
                    "You must be a project member to view messages"
            );
        }

        return chatMessageRepository
                .findByProjectIdWithSender(projectId, pageable)
                .map(ChatMessageResponse::new);
    }


    /**
     * Get recent messages (last 24 hours)
     */
    public List<ChatMessage> getRecentMessages(String projectId, String userId) {
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new ForbiddenException("You must be a project member to view messages");
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
            throw new ForbiddenException("You must be a project member to search messages");
        }
        
        return chatMessageRepository.searchMessagesByContent(projectId, query, pageable);
    }
    
    /**
     * Get messages after a specific time (for real-time updates)
     */
    public List<ChatMessage> getMessagesAfter(String projectId, LocalDateTime after, String userId) {
        // Check if user is a member of the project
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new ForbiddenException("You must be a project member to view messages");
        }
        
        return chatMessageRepository.findMessagesAfter(projectId, after);
    }
    
    /**
     * Get latest message in project
     */
    public ChatMessage getLatestMessage(String projectId, String userId) {
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new ForbiddenException("You must be a project member to view messages");
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
            throw new ForbiddenException("You must be a project member to view message count");
        }
        
        return chatMessageRepository.countByProjectId(projectId);
    }
    
    /**
     * Find message by ID
     */
    public ChatMessage findById(Long messageId) {
        return chatMessageRepository.findByIdWithAssociations(messageId)
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
