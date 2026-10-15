package com.ADP.peerConnect.controller;
import com.ADP.peerConnect.model.dto.response.NotificationResponse;
import com.ADP.peerConnect.model.dto.response.UnreadCountResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.InboxNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor @RequestMapping("/api/notifications")
public class InboxNotificationController {
    private final InboxNotificationService service;
    @GetMapping public ResponseEntity<Page<NotificationResponse>> list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(service.page(principal.getId(),page,size)); }
    @GetMapping("/unread-count") public ResponseEntity<UnreadCountResponse> unread(@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(new UnreadCountResponse(service.unreadCount(principal.getId()))); }
    @PatchMapping("/{id}/read") public ResponseEntity<Void> read(@PathVariable String id,@AuthenticationPrincipal UserPrincipal principal) { service.markRead(principal.getId(),id); return ResponseEntity.noContent().build(); }
    @PatchMapping("/read-all") public ResponseEntity<Void> readAll(@AuthenticationPrincipal UserPrincipal principal) { service.markAllRead(principal.getId()); return ResponseEntity.noContent().build(); }
}
