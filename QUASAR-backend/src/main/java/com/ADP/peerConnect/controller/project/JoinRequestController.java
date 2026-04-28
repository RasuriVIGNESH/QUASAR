package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.SendJoinRequestRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectInvitationResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectJoinRequestResponse;
import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.service.Interface.iProjectInvitationService;
import com.ADP.peerConnect.service.Interface.iProjectJoinRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Join Request Management", description = "APIs for managing project join requests")
@RestController
@RequestMapping("/api")
public class JoinRequestController {

    @Autowired
    private iProjectJoinRequestService joinRequestService;

    @Autowired
    private iProjectInvitationService projectInvitationService;

    @PostMapping("/projects/{projectId}/join-requests")
    @Operation(summary = "Send a request to join a project")
    public ResponseEntity<ApiResponse> sendJoinRequest(
            @PathVariable String projectId,
            @Valid @RequestBody SendJoinRequestRequest request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        var savedRequest = joinRequestService.sendJoinRequest(projectId, currentUser.getId(), request.getMessage());
        return ResponseEntity.ok(new ApiResponse(true, "Join request sent successfully.", new ProjectJoinRequestResponse(savedRequest)));
    }

    @PutMapping("/join-requests/{requestId}/accept")
    @Operation(summary = "Accept a join request (Lead only)")
    public ResponseEntity<ApiResponse> acceptJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        joinRequestService.acceptJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request accepted."));
    }

    @PutMapping("/join-requests/{requestId}/reject")
    @Operation(summary = "Reject a join request (Lead only)")
    public ResponseEntity<ApiResponse> rejectJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        joinRequestService.rejectJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request rejected."));
    }

    @DeleteMapping("/join-requests/{requestId}/cancel")
    @Operation(summary = "Cancel a sent join request (requester only)")
    public ResponseEntity<ApiResponse> cancelJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        joinRequestService.cancelJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request canceled."));
    }

    @GetMapping("/projects/invitations/received")
    public ResponseEntity<Page<ProjectInvitationResponse>> getReceivedInvitationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);

        Page<ProjectInvitationResponse> response =
                projectInvitationService.getUserInvitations(currentUser.getId(), pageable);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/projects/{projectId}/join-requests")
    @Operation(summary = "Get all join requests for a project (Lead only)")
    public ResponseEntity<List<ProjectJoinRequestResponse>> getProjectJoinRequests(
            @PathVariable String projectId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectJoinRequestResponse> response = joinRequestService.getProjectJoinRequests(projectId, currentUser.getId())
                .stream().map(ProjectJoinRequestResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/join-requests/my-requests")
    @Operation(summary = "Get all join requests sent by the current user")
    public ResponseEntity<List<ProjectJoinRequestResponse>> getMyJoinRequests(
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectJoinRequestResponse> response = joinRequestService.getUserJoinRequests(currentUser.getId())
                .stream().map(ProjectJoinRequestResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
