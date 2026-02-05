package com.ADP.peerConnect.controller.Student;

import com.ADP.peerConnect.model.dto.request.Project.InviteUserRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectInvitationResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectMemberResponse;
import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.entity.ProjectMember;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.repository.ProjectInvitationRepository;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iTeamService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for team management operations
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Team Management", description = "Team and invitation management APIs")
public class TeamController {

    @Autowired
    private iTeamService teamService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private ProjectInvitationRepository invitationRepository;

    /**
     * Invite user to project
     */
    @PostMapping("/teams/{projectId}/invitations")
    @Operation(summary = "Invite user to project", description = "Send invitation to user to join project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Invitation sent successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can invite"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project or user not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already invited or member")
    })
    public ResponseEntity<ApiResponse<ProjectInvitationResponse>> inviteUserToProject(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Valid @RequestBody InviteUserRequest inviteRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ProjectInvitation invitation = teamService.inviteUserToProject(
                projectId, inviteRequest.getUserId(), inviteRequest.getRole(),
                inviteRequest.getMessage(), currentUser.getId());

        ProjectInvitationResponse response = modelMapper.map(invitation, ProjectInvitationResponse.class);

        ApiResponse<ProjectInvitationResponse> apiResponse = ApiResponse.success(
                "Invitation sent successfully", response);

        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    /**
     * Respond to invitation
     */
    @PutMapping("/projects/invitations/{invitationId}/respond")
    @Operation(summary = "Respond to invitation", description = "Accept or decline project invitation")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Response recorded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid response"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invitation not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Invitation already responded to")
    })
    public ResponseEntity<ApiResponse<ProjectInvitationResponse>> respondToInvitation(
            @Parameter(description = "Invitation ID") @PathVariable Long invitationId,
            @Parameter(description = "Response (ACCEPTED or DECLINED)") @RequestParam InvitationStatus response,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ProjectInvitation invitation = teamService.respondToInvitation(invitationId, response, currentUser.getId());
        ProjectInvitationResponse invitationResponse = modelMapper.map(invitation, ProjectInvitationResponse.class);

        String message = response == InvitationStatus.ACCEPTED ?
                "Invitation accepted successfully" : "Invitation declined";

        ApiResponse<ProjectInvitationResponse> apiResponse = ApiResponse.success(message, invitationResponse);

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Cancel invitation
     */
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
            @AuthenticationPrincipal UserPrincipal currentUser) {

        teamService.cancelInvitation(invitationId, currentUser.getId());

        ApiResponse<Void> response = ApiResponse.success("Invitation cancelled successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Get project invitations
     */
    @GetMapping("/projects/{projectId}/invitations")
    @Operation(summary = "Get project invitations", description = "Get all invitations for a project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invitations retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ProjectInvitationResponse>>> getProjectInvitations(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("invitedAt").descending());
        Page<ProjectInvitation> invitations = teamService.getProjectInvitations(projectId, pageable);

        List<ProjectInvitationResponse> invitationResponses = invitations.getContent().stream()
                .map(invitation -> modelMapper.map(invitation, ProjectInvitationResponse.class))
                .collect(Collectors.toList());

        PagedResponse<ProjectInvitationResponse> pagedResponse = new PagedResponse<>(
                invitationResponses, invitations.getNumber(), invitations.getSize(),
                invitations.getTotalElements(), invitations.getTotalPages());

        ApiResponse<PagedResponse<ProjectInvitationResponse>> response = ApiResponse.success(
                "Invitations retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Get user invitations
     */
    @GetMapping("/users/{userId}/invitations")
    @Operation(summary = "Get user invitations", description = "Get all invitations for a user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "user invitations retrieved successfully")
    })
    public PagedResponse<ProjectInvitationResponse> getUserInvitations(String userId, InvitationStatus status, Pageable pageable) {
        Page<ProjectInvitation> invitationsPage = invitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        List<ProjectInvitationResponse> invitationDtos = invitationsPage.getContent().stream()
                .map(invitation -> modelMapper.map(invitation, ProjectInvitationResponse.class))
                .collect(Collectors.toList());
        return new PagedResponse<>(
                invitationDtos,
                invitationsPage.getNumber(),
                invitationsPage.getSize(),
                invitationsPage.getTotalElements(),
                invitationsPage.getTotalPages()
        );
    }

    @GetMapping("/invitations/pending")
    @Operation(summary = "Get pending invitations", description = "Get pending invitations for current user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pending invitations retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ProjectInvitationResponse>>> getPendingInvitations(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("invitedAt").descending());
        Page<ProjectInvitation> invitations = teamService.getPendingInvitationsForUser(currentUser.getId(), pageable);

        List<ProjectInvitationResponse> invitationResponses = invitations.getContent().stream()
                .map(invitation -> modelMapper.map(invitation, ProjectInvitationResponse.class))
                .collect(Collectors.toList());

        PagedResponse<ProjectInvitationResponse> pagedResponse = new PagedResponse<>(
                invitationResponses, invitations.getNumber(), invitations.getSize(),
                invitations.getTotalElements(), invitations.getTotalPages());

        ApiResponse<PagedResponse<ProjectInvitationResponse>> response = ApiResponse.success(
                "Pending invitations retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/projects/{projectId}/members")
    @Operation(summary = "Get project members", description = "Get all members of a project")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getProjectMembers(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectMemberResponse> memberResponses = teamService.getProjectMembers(projectId, currentUser.getId());

        ApiResponse<List<ProjectMemberResponse>> response = ApiResponse.success(
                "Members retrieved successfully", memberResponses);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/projects/{projectId}/members/{memberId}")
    @Operation(summary = "Remove project member", description = "Remove member from project (Lead only)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Member removed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can remove members"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Cannot remove project Lead")
    })
    public ResponseEntity<ApiResponse<Void>> removeMemberFromProject(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Member user ID") @PathVariable String memberId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        teamService.removeMemberFromProject(projectId, memberId, currentUser.getId());

        ApiResponse<Void> response = ApiResponse.success("Member removed successfully");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects/{projectId}/leave")
    @Operation(summary = "Leave project", description = "Leave a project (non-Lead only)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Left project successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not a member of this project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Project Lead cannot leave")
    })
    public ResponseEntity<ApiResponse<Void>> leaveProject(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        teamService.leaveProject(projectId, currentUser.getId());

        ApiResponse<Void> response = ApiResponse.success("Left project successfully");

        return ResponseEntity.ok(response);
    }
    @PutMapping("/projects/{projectId}/members/{memberId}/role")
    @Operation(summary = "Update member role", description = "Update project member role (Lead only)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can update roles"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Cannot change Lead role")
    })
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateMemberRole(
            @Parameter(description = "Project ID") @PathVariable String projectId,
            @Parameter(description = "Member user ID") @PathVariable String memberId,
            @Parameter(description = "New role") @RequestParam ProjectRole role,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ProjectMember member = teamService.updateMemberRole(projectId, memberId, role, currentUser.getId());
        ProjectMemberResponse memberResponse = modelMapper.map(member, ProjectMemberResponse.class);

        ApiResponse<ProjectMemberResponse> response = ApiResponse.success(
                "Role updated successfully", memberResponse);

        return ResponseEntity.ok(response);
    }
}