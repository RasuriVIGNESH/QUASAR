package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.exception.InvalidCollaborationDecisionException;
import com.ADP.peerConnect.model.dto.request.Project.InviteUser;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.InvitationsAndRequestsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api")
public class RequestInvitationController {
    private final InvitationsAndRequestsService service;

    public RequestInvitationController(InvitationsAndRequestsService service) {
        this.service = service;
    }

    @PostMapping("/{projectId}/Invite")
    @Operation(summary = "Invite a student to a project", description = "Only the project lead may invite a student. Provide roleId when the project has required roles.")
    public ResponseEntity<ApiResponse<InvitationsAndRequestsResponse>> sendInvitation(
            @PathVariable String projectId,
            @Valid @RequestBody InviteUser invitation,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        InvitationsAndRequestsResponse result = service.sendInvitation(
                projectId, invitation.getInvitedId(), invitation.getMessage(),
                currentUser.getId(), invitation.getRoleId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invitation sent successfully", result));
    }

    @PostMapping("/projects/{projectId}/join-request")
    @Operation(summary = "Request to join a project", description = "Keep the existing JSON-string message body; pass roleId as a query parameter when the project has required roles.")
    public ResponseEntity<InvitationsAndRequestsResponse> sendJoinRequest(
            @PathVariable String projectId,
            @RequestBody(required = false) @Size(max = 500, message = "Message must not exceed 500 characters") String message,
            @RequestParam(required = false) @Positive Long roleId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        InvitationsAndRequestsResponse result = service.sendJoinRequest(
                projectId, currentUser.getId(), message, roleId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/projects/{projectId}/invitations-requests")
    @Operation(summary = "List project join requests", description = "Only the project lead may review join requests.")
    public ResponseEntity<PagedResponse<InvitationsAndRequestsResponse>> getProjectJoinRequests(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Page<InvitationsAndRequestsResponse> results = service.getProjectJoinRequests(
                projectId, currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(toPagedResponse(results));
    }

    @GetMapping("/User/invitations-requests")
    @Operation(summary = "List invitations received by the current student")
    public ResponseEntity<PagedResponse<InvitationsAndRequestsResponse>> getReceivedInvitations(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "PENDING") Status status,
            @RequestParam(defaultValue = "false") boolean all,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InvitationsAndRequestsResponse> invitations = all
                ? service.getUserInvitations(currentUser.getId(), pageable)
                : service.getUserInvitationsByStatus(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(toPagedResponse(invitations));
    }

    @GetMapping("/User/join-requests")
    @Operation(summary = "List join requests sent by the current student")
    public ResponseEntity<PagedResponse<InvitationsAndRequestsResponse>> getMyJoinRequests(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(toPagedResponse(service.getUserJoinRequests(
                currentUser.getId(), PageRequest.of(page, size))));
    }

    @PutMapping("/{requestId}/respond")
    @Operation(summary = "Accept or reject an invitation or join request")
    public ResponseEntity<ApiResponse<String>> respondToInvitationOrRequest(
            @PathVariable @Positive Long requestId,
            @RequestParam Status response,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        if (response == Status.ACCEPTED) {
            service.accept(requestId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Collaboration request accepted."));
        }
        if (response == Status.REJECTED) {
            service.reject(requestId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Collaboration request rejected."));
        }
        throw new InvalidCollaborationDecisionException();
    }

    @PutMapping("/projects/invitations/{invitationId}/cancel")
    @Operation(summary = "Cancel a pending invitation")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @PathVariable @Positive Long invitationId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        service.cancelInvitation(invitationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Invitation cancelled successfully"));
    }

    @DeleteMapping("/User/join-requests/{requestId}")
    @Operation(summary = "Withdraw a pending join request")
    public ResponseEntity<ApiResponse<Void>> cancelJoinRequest(
            @PathVariable @Positive Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        service.cancelJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Join request withdrawn successfully"));
    }

    private PagedResponse<InvitationsAndRequestsResponse> toPagedResponse(
            Page<InvitationsAndRequestsResponse> page) {
        PagedResponse<InvitationsAndRequestsResponse> response = new PagedResponse<>(
                page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setNumberOfElements(page.getNumberOfElements());
        return response;
    }
}
