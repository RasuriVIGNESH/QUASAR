package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.SendJoinRequestRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectInvitationResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectJoinRequestResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iProjectInvitationService;
import com.ADP.peerConnect.service.Interface.iProjectJoinRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Join Requests & Invitations")
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
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectJoinRequestResponse savedRequest =
                joinRequestService.sendJoinRequest(projectId, currentUser.getId(), request.getMessage());

        return ResponseEntity.ok(new ApiResponse(true, "Join request sent successfully.", savedRequest));
    }
    @GetMapping("/join-requests/my-requests")
    @Operation(summary = "Get current user's join requests")
    public ResponseEntity<PagedResponse<ProjectJoinRequestResponse>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);

        Page<ProjectJoinRequestResponse> requests =
                joinRequestService.getMyRequests(
                        currentUser.getId(),
                        pageable
                );

        PagedResponse<ProjectJoinRequestResponse> response =
                new PagedResponse<>(
                        requests.getContent(),
                        requests.getNumber(),
                        requests.getSize(),
                        requests.getTotalElements(),
                        requests.getTotalPages()
                );

        response.setFirst(requests.isFirst());
        response.setLast(requests.isLast());
        response.setNumberOfElements(
                requests.getNumberOfElements()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/join-requests/{requestId}/accept")
    @Operation(summary = "Accept a join request (Lead only)")
    public ResponseEntity<ApiResponse> acceptJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        joinRequestService.acceptJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request accepted."));
    }
    @GetMapping("/projects/{projectId}/join-requests")
    @Operation(summary = "Get join requests for a project")
    public ResponseEntity<ApiResponse> getProjectJoinRequests(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        "Join requests retrieved successfully",
                        joinRequestService.getProjectJoinRequests(
                                projectId,
                                currentUser.getId()
                        )
                )
        );
    }

    @PutMapping("/join-requests/{requestId}/reject")
    @Operation(summary = "Reject a join request (Lead only)")
    public ResponseEntity<ApiResponse> rejectJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        joinRequestService.rejectJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request rejected."));
    }

    @DeleteMapping("/join-requests/{requestId}")
    @Operation(summary = "Cancel a join request (requester only)")
    public ResponseEntity<ApiResponse> cancelJoinRequest(
            @PathVariable Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        joinRequestService.cancelJoinRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Join request cancelled."));
    }

    @GetMapping("/projects/invitations/received")
    public ResponseEntity<PagedResponse<ProjectInvitationResponse>> getReceivedInvitationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProjectInvitationResponse> invitations =
                projectInvitationService.getUserInvitations(currentUser.getId(), pageable);

        PagedResponse<ProjectInvitationResponse> response = new PagedResponse<>(
                invitations.getContent(),
                invitations.getNumber(),
                invitations.getSize(),
                invitations.getTotalElements(),
                invitations.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }
}