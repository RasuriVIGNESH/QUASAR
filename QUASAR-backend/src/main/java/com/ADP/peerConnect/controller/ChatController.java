package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.request.SendMessageRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.ChatMessageResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iChatService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for chat management operations
 */
@RestController
@RequestMapping(Constants.CHAT_BASE_PATH)
@Tag(name = "Chat Management", description = "Chat and messaging APIs")
public class ChatController {
    
    @Autowired
    private iChatService chatService;
    
    @Autowired
    private ModelMapper modelMapper;
    
    /**
     * Send message to project chat
     */
    @PostMapping("/projects/{projectId}/messages")
    @Operation(summary = "Send message", description = "Send message to project chat")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Message sent successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Valid @RequestBody SendMessageRequest messageRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        ChatMessage message = chatService.sendMessage(projectId, currentUser.getId(), messageRequest.getContent());
        ChatMessageResponse messageResponse = modelMapper.map(message, ChatMessageResponse.class);
        
        ApiResponse<ChatMessageResponse> response = ApiResponse.success(
            "Message sent successfully", messageResponse);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get project messages
     */
    @GetMapping("/projects/{projectId}/messages")
    @Operation(summary = "Get project messages", description = "Get messages for a project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ChatMessageResponse>>> getProjectMessages(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ChatMessage> messages = chatService.getProjectMessages(projectId, currentUser.getId(), pageable);
        
        List<ChatMessageResponse> messageResponses = messages.getContent().stream()
            .map(message -> modelMapper.map(message, ChatMessageResponse.class))
            .collect(Collectors.toList());
        
        PagedResponse<ChatMessageResponse> pagedResponse = new PagedResponse<>(
            messageResponses, messages.getNumber(), messages.getSize(), 
            messages.getTotalElements(), messages.getTotalPages());
        
        ApiResponse<PagedResponse<ChatMessageResponse>> response = ApiResponse.success(
            "Messages retrieved successfully", pagedResponse);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent messages
     */
    @GetMapping("/projects/{projectId}/messages/recent")
    @Operation(summary = "Get recent messages", description = "Get recent messages (last 24 hours)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Recent messages retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member")
    })
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getRecentMessages(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<ChatMessage> messages = chatService.getRecentMessages(projectId, currentUser.getId());
        
        List<ChatMessageResponse> messageResponses = messages.stream()
            .map(message -> modelMapper.map(message, ChatMessageResponse.class))
            .collect(Collectors.toList());
        
        ApiResponse<List<ChatMessageResponse>> response = ApiResponse.success(
            "Recent messages retrieved successfully", messageResponses);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search messages
     */
    @GetMapping("/projects/{projectId}/messages/search")
    @Operation(summary = "Search messages", description = "Search messages by content")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ChatMessageResponse>>> searchMessages(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ChatMessage> messages = chatService.searchMessages(projectId, query, currentUser.getId(), pageable);
        
        List<ChatMessageResponse> messageResponses = messages.getContent().stream()
            .map(message -> modelMapper.map(message, ChatMessageResponse.class))
            .collect(Collectors.toList());
        
        PagedResponse<ChatMessageResponse> pagedResponse = new PagedResponse<>(
            messageResponses, messages.getNumber(), messages.getSize(), 
            messages.getTotalElements(), messages.getTotalPages());
        
        ApiResponse<PagedResponse<ChatMessageResponse>> response = ApiResponse.success(
            "Messages retrieved successfully", pagedResponse);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get messages after specific time (for real-time updates)
     */
    @GetMapping("/projects/{projectId}/messages/after")
    @Operation(summary = "Get messages after time", description = "Get messages sent after a specific time")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member")
    })
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessagesAfter(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Get messages after this time") @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<ChatMessage> messages = chatService.getMessagesAfter(projectId, after, currentUser.getId());
        
        List<ChatMessageResponse> messageResponses = messages.stream()
            .map(message -> modelMapper.map(message, ChatMessageResponse.class))
            .collect(Collectors.toList());
        
        ApiResponse<List<ChatMessageResponse>> response = ApiResponse.success(
            "Messages retrieved successfully", messageResponses);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Edit message
     */
    @PutMapping("/messages/{messageId}")
    @Operation(summary = "Edit message", description = "Edit a message (sender only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Message edited successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Can only edit own messages"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Message not found")
    })
    public ResponseEntity<ApiResponse<ChatMessageResponse>> editMessage(
            @Parameter(description = "Message ID") @PathVariable Long messageId,
            @Valid @RequestBody SendMessageRequest messageRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        ChatMessage message = chatService.editMessage(messageId, currentUser.getId(), messageRequest.getContent());
        ChatMessageResponse messageResponse = modelMapper.map(message, ChatMessageResponse.class);
        
        ApiResponse<ChatMessageResponse> response = ApiResponse.success(
            "Message edited successfully", messageResponse);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete message
     */
    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Delete message", description = "Delete a message (sender or project Lead)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Message deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Can only delete own messages or if project Lead"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Message not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @Parameter(description = "Message ID") @PathVariable Long messageId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        chatService.deleteMessage(messageId, currentUser.getId());
        
        ApiResponse<Void> response = ApiResponse.success("Message deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get latest message in project
     */
    @GetMapping("/projects/{projectId}/messages/latest")
    @Operation(summary = "Get latest message", description = "Get the latest message in project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Latest message retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member")
    })
    public ResponseEntity<ApiResponse<ChatMessageResponse>> getLatestMessage(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        ChatMessage message = chatService.getLatestMessage(projectId, currentUser.getId());
        
        if (message == null) {
            ApiResponse<ChatMessageResponse> response = ApiResponse.success(
                "No messages found", null);
            return ResponseEntity.ok(response);
        }
        
        ChatMessageResponse messageResponse = modelMapper.map(message, ChatMessageResponse.class);
        
        ApiResponse<ChatMessageResponse> response = ApiResponse.success(
            "Latest message retrieved successfully", messageResponse);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get message count for project
     */
    @GetMapping("/projects/{projectId}/messages/count")
    @Operation(summary = "Get message count", description = "Get total message count for project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Message count retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Must be project member")
    })
    public ResponseEntity<ApiResponse<Long>> getMessageCount(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        long count = chatService.getMessageCount(projectId, currentUser.getId());
        
        ApiResponse<Long> response = ApiResponse.success(
            "Message count retrieved successfully", count);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get message by ID
     */
    @GetMapping("/messages/{messageId}")
    @Operation(summary = "Get message", description = "Get message by ID")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Message retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Message not found")
    })
    public ResponseEntity<ApiResponse<ChatMessageResponse>> getMessageById(
            @Parameter(description = "Message ID") @PathVariable Long messageId) {

        ChatMessage message = chatService.findById(messageId);
        ChatMessageResponse messageResponse = modelMapper.map(message, ChatMessageResponse.class);
        
        ApiResponse<ChatMessageResponse> response = ApiResponse.success(
            "Message retrieved successfully", messageResponse);
        
        return ResponseEntity.ok(response);
    }
}
