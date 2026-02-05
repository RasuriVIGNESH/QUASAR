package com.ADP.peerConnect.controller.Student;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.NotificationResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.entity.Notification;
import com.ADP.peerConnect.model.enums.NotificationType;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iNotificationService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for notification management operations
 */
@RestController
@RequestMapping(Constants.NOTIFICATION_BASE_PATH)
@Tag(name = "Notification Management", description = "Notification management APIs")
public class NotificationController {
    
    @Autowired
    private iNotificationService notificationService;
    
    @Autowired
    private ModelMapper modelMapper;
    
    /**
     * Get user notifications
     */
    @GetMapping
    @Operation(summary = "Get notifications", description = "Get notifications for current user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @Parameter(description = "Filter by type") @RequestParam(required = false) NotificationType type,
            @Parameter(description = "Show only unread") @RequestParam(defaultValue = "false") boolean unreadOnly,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications;
        
        if (unreadOnly) {
            notifications = notificationService.getUnreadNotifications(currentUser.getId(), pageable);
        } else if (type != null) {
            notifications = notificationService.getNotificationsByType(currentUser.getId(), type, pageable);
        } else {
            notifications = notificationService.getUserNotifications(currentUser.getId(), pageable);
        }
        
        List<NotificationResponse> notificationResponses = notifications.getContent().stream()
            .map(notification -> modelMapper.map(notification, NotificationResponse.class))
            .collect(Collectors.toList());
        
        PagedResponse<NotificationResponse> pagedResponse = new PagedResponse<>(
            notificationResponses, notifications.getNumber(), notifications.getSize(), 
            notifications.getTotalElements(), notifications.getTotalPages());
        
        ApiResponse<PagedResponse<NotificationResponse>> response = ApiResponse.success(
            "Notifications retrieved successfully", pagedResponse);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent unread notifications
     */
    @GetMapping("/recent")
    @Operation(summary = "Get recent notifications", description = "Get recent unread notifications (last 24 hours)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Recent notifications retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getRecentNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<Notification> notifications = notificationService.getRecentUnreadNotifications(currentUser.getId());
        
        List<NotificationResponse> notificationResponses = notifications.stream()
            .map(notification -> modelMapper.map(notification, NotificationResponse.class))
            .collect(Collectors.toList());
        
        ApiResponse<List<NotificationResponse>> response = ApiResponse.success(
            "Recent notifications retrieved successfully", notificationResponses);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        long unreadCount = notificationService.getUnreadCount(currentUser.getId());
        
        ApiResponse<Long> response = ApiResponse.success(
            "Unread count retrieved successfully", unreadCount);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark as read", description = "Mark notification as read")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot mark other user's notification")
    })
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @Parameter(description = "Notification ID") @PathVariable Long notificationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        notificationService.markAsRead(notificationId, currentUser.getId());
        
        ApiResponse<Void> response = ApiResponse.success("Notification marked as read");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All notifications marked as read")
    })
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        int updatedCount = notificationService.markAllAsRead(currentUser.getId());
        
        ApiResponse<Integer> response = ApiResponse.success(
            "All notifications marked as read", updatedCount);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete notification
     */
    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Delete a notification")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot delete other user's notification")
    })
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable Long notificationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        notificationService.deleteNotification(notificationId, currentUser.getId());
        
        ApiResponse<Void> response = ApiResponse.success("Notification deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete all notifications
     */
    @DeleteMapping("/all")
    @Operation(summary = "Delete all notifications", description = "Delete all notifications for current user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All notifications deleted successfully")
    })
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        notificationService.deleteAllNotifications(currentUser.getId());
        
        ApiResponse<Void> response = ApiResponse.success("All notifications deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get notification by ID
     */
    @GetMapping("/{notificationId}")
    @Operation(summary = "Get notification", description = "Get notification by ID")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @Parameter(description = "Notification ID") @PathVariable Long notificationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Notification notification = notificationService.findById(notificationId);
        
        // Verify the notification belongs to the current user
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new com.ADP.peerConnect.exception.UnauthorizedException("You can only view your own notifications");
        }
        
        NotificationResponse notificationResponse = modelMapper.map(notification, NotificationResponse.class);
        
        ApiResponse<NotificationResponse> response = ApiResponse.success(
            "Notification retrieved successfully", notificationResponse);
        
        return ResponseEntity.ok(response);
    }
}
