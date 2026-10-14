package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.InviteUser;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.InvitationsAndRequestsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static com.ADP.peerConnect.model.enums.Status.PENDING;

@Tag(name = "Join Requests & Invitations")
@RestController
@RequestMapping("/api")
public class RequestInvitationController {

    @Autowired
    private InvitationsAndRequestsService service;

    @PostMapping("/{projectId}/Invite")
    @Operation(summary = "Invite user to project", description = "Send invitation to user to join project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Invitation sent successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can invite"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project or user not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already invited or member")
    })
    public ResponseEntity<ApiResponse<InvitationsAndRequestsResponse>> sendInvitation(
            @PathVariable String projectId,
            @RequestBody InviteUser Invitation,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            InvitationsAndRequestsResponse invitation=service.sendInvitation(
                    projectId, Invitation.getInvitedId(),Invitation.getMessage(), currentUser.getId());
            ApiResponse<InvitationsAndRequestsResponse> apiResponse = ApiResponse.success(
                    "Invitation sent successfully", invitation);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(false, e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    @PostMapping("/projects/{projectId}/join-request")
    @Operation(summary = "Send a request to join a project")
    public ResponseEntity<InvitationsAndRequestsResponse> sendJoinRequest(
            @PathVariable String projectId,
            @Valid @RequestBody String message,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        InvitationsAndRequestsResponse savedRequest =
                service.sendJoinRequest(projectId, currentUser.getId(), message);
        return new ResponseEntity<>(savedRequest, HttpStatus.OK);
    }


    @GetMapping("/projects/{projectId}/invitations-requests")
    public ResponseEntity<PagedResponse<InvitationsAndRequestsResponse>> getProjectJoinRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);

        Page<InvitationsAndRequestsResponse> requests =
                service.getProjectJoinRequests(
                        projectId,
                        currentUser.getId(),
                        pageable
                );

        PagedResponse<InvitationsAndRequestsResponse> response =
                new PagedResponse<>(
                        requests.getContent(),
                        requests.getNumber(),
                        requests.getSize(),
                        requests.getTotalElements(),
                        requests.getTotalPages()
                );

        response.setFirst(requests.isFirst());
        response.setLast(requests.isLast());
        response.setNumberOfElements(requests.getNumberOfElements());

        return ResponseEntity.ok(response);
    }
    @GetMapping("/User/invitations-requests")
    public ResponseEntity<PagedResponse<InvitationsAndRequestsResponse>>
    getReceivedInvitationsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "PENDING") Status status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);

        Page<InvitationsAndRequestsResponse> invitations;

        if (status == Status.PENDING) {
            invitations =
                    service.getPendingInvitations(
                            currentUser.getId(),
                            pageable
                    );
        } else {
            invitations =
                    service.getUserInvitations(
                            currentUser.getId(),
                            pageable
                    );
        }

        PagedResponse<InvitationsAndRequestsResponse> response =
                new PagedResponse<>(
                        invitations.getContent(),
                        invitations.getNumber(),
                        invitations.getSize(),
                        invitations.getTotalElements(),
                        invitations.getTotalPages()
                );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{requestId}/respond")
    @Operation(summary = "Accept or reject -> for both requests and invitations")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Response recorded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid response"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invitation not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Invitation already responded to")
    })
    public ResponseEntity<ApiResponse<String>> respondToInvitationorRequest(
            @PathVariable Long requestId,
            @Parameter(description = "Response (ACCEPTED or REJECTED)") @RequestParam Status response,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser){

        if(response.equals(Status.ACCEPTED)){
            service.accept(requestId,currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Join request accepted."));
        }else if(response.equals(Status.REJECTED)){
            service.reject(requestId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Join request rejected."));
        }
        return null;
    }
    @PutMapping("/projects/invitations/{invitationId}/cancel")
    @Operation(summary = "Cancel invitation", description = "Cancel pending project invitation")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invitation cancelled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invitation not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Can only cancel pending invitations")
    })
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @Parameter(description = "Invitation ID") @PathVariable Long invitationId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        service.cancelInvitation(invitationId, currentUser.getId());
        ApiResponse<Void> response = ApiResponse.success("Invitation cancelled successfully");
        return ResponseEntity.ok(response);
    }

}