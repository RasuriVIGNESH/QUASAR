package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.SendMessageRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.ChatMessageResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iChatService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(Constants.CHAT_BASE_PATH)
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Chat Management", description = "Chat and messaging APIs")
public class ChatController {

    @Autowired
    private iChatService chatService;

    /**
     * Send message
     */
    @PostMapping("/projects/{projectId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable String projectId,
            @Valid @RequestBody SendMessageRequest messageRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ChatMessage message = chatService.sendMessage(
                projectId,
                currentUser.getId(),
                messageRequest.getContent()
        );

        // ✅ FIXED
        ChatMessageResponse messageResponse = new ChatMessageResponse(message);

        return new ResponseEntity<>(
                ApiResponse.success("Message sent successfully", messageResponse),
                HttpStatus.CREATED
        );
    }

    /**
     * Get messages
     */
    @GetMapping("/projects/{projectId}/messages")
    public ResponseEntity<ApiResponse<PagedResponse<ChatMessageResponse>>> getProjectMessages(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        Page<ChatMessage> messages = chatService.getProjectMessages(
                projectId, currentUser.getId(), pageable
        );

        // ✅ FIXED
        List<ChatMessageResponse> messageResponses = messages.getContent()
                .stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());

        PagedResponse<ChatMessageResponse> pagedResponse = new PagedResponse<>(
                messageResponses,
                messages.getNumber(),
                messages.getSize(),
                messages.getTotalElements(),
                messages.getTotalPages()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Messages retrieved successfully", pagedResponse)
        );
    }

    /**
     * Get recent messages
     */
    @GetMapping("/projects/{projectId}/messages/recent")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getRecentMessages(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<ChatMessage> messages = chatService.getRecentMessages(
                projectId, currentUser.getId()
        );

        // ✅ FIXED
        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success("Recent messages retrieved successfully", messageResponses)
        );
    }

    /**
     * Get messages after time
     */
    @GetMapping("/projects/{projectId}/messages/after")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessagesAfter(
            @PathVariable String projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<ChatMessage> messages = chatService.getMessagesAfter(
                projectId, after, currentUser.getId()
        );

        // ✅ FIXED
        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success("Messages retrieved successfully", messageResponses)
        );
    }

    /**
     * Edit message
     */
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> editMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody SendMessageRequest messageRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ChatMessage message = chatService.editMessage(
                messageId,
                currentUser.getId(),
                messageRequest.getContent()
        );

        // ✅ FIXED
        ChatMessageResponse messageResponse = new ChatMessageResponse(message);

        return ResponseEntity.ok(
                ApiResponse.success("Message edited successfully", messageResponse)
        );
    }

    /**
     * Delete message
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        chatService.deleteMessage(messageId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Message deleted successfully")
        );
    }
}