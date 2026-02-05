package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.response.Project.ProjectInvitationResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.ProjectInvitationRepository;
import com.ADP.peerConnect.repository.ProjectMemberRepository;
import com.ADP.peerConnect.service.Interface.iTeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ADP.peerConnect.model.dto.response.Project.ProjectMemberResponse;
import org.modelmapper.ModelMapper;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for team management operations
 */
@Service
@Transactional
public class TeamService implements iTeamService {

    @Autowired
    private ProjectInvitationRepository invitationRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Invite user to project
     */
    public ProjectInvitation inviteUserToProject(String projectId, String invitedUserId,
                                                 ProjectRole role, String message, String invitedById) {
        // Validate project exists and user has permission
        Project project = projectService.findById(projectId);

        // Check if inviter is project Lead or admin
        if (!projectService.isProjectLead(projectId, invitedById)) {
            throw new UnauthorizedException("Only project Lead" +
                    " can invite users");
        }

        // Check if project is still recruiting
        if (project.getStatus() != ProjectStatus.RECRUITING) {
            throw new ConflictException("Project is not currently recruiting");
        }

        // Check if project has available spots
        long currentTeamSize = projectService.getCurrentTeamSize(projectId);
        if (currentTeamSize >= project.getMaxTeamSize()) {
            throw new ConflictException("Project team is already full");
        }

        // Check if user exists
        User invitedUser = userService.findById(invitedUserId);
        User invitedBy = userService.findById(invitedById);

        // Check if user is already a member
        if (projectService.isProjectMember(projectId, invitedUserId)) {
            throw new ConflictException("User is already a member of this project");
        }

        /// Check if there's already a pending invitation
        if (invitationRepository.existsByProjectIdAndInvitedUserIdAndStatus(projectId, invitedUserId, InvitationStatus.PENDING)) {
            throw new ConflictException("A pending invitation already exists for this user and project.");
        }

        // Create invitation
        ProjectInvitation invitation = new ProjectInvitation();
        invitation.setProject(project);
        invitation.setInvitedUser(invitedUser);
        invitation.setInvitedBy(invitedBy);
        invitation.setRole(role);
        invitation.setMessage(message);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setInvitedAt(LocalDateTime.now());

        return invitationRepository.save(invitation);
    }

    /**
     * Respond to project invitation
     */
    public ProjectInvitation respondToInvitation(Long invitationId, InvitationStatus response, String userId) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Check if user is the invited user
        if (!invitation.getInvitedUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only respond to your own invitations");
        }

        // Check if invitation is still pending
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("Invitation has already been responded to");
        }

        // Validate response
        if (response != InvitationStatus.ACCEPTED && response != InvitationStatus.REJECTED) {
            throw new BadRequestException("Invalid response. Must be ACCEPTED or DECLINED");
        }

        // Update invitation
        invitation.setStatus(response);
        invitation.setRespondedAt(LocalDateTime.now());

        // If accepted, add user to project
        if (response == InvitationStatus.ACCEPTED) {
            // Check if project still has available spots
            Project project = invitation.getProject();
            long currentTeamSize = projectService.getCurrentTeamSize(project.getId());
            if (currentTeamSize >= project.getMaxTeamSize()) {
                throw new ConflictException("Project team is now full");
            }

            // Check if user is not already a member (race condition check)
            if (projectService.isProjectMember(project.getId(), userId)) {
                throw new ConflictException("User is already a member of this project");
            }

            // Add user as project member
            ProjectMember member = new ProjectMember();
            member.setProject(project);
            member.setUser(invitation.getInvitedUser());
            member.setRole(invitation.getRole());
            member.setCreatedAt(LocalDateTime.now());

            memberRepository.save(member);
        }

        return invitationRepository.save(invitation);
    }

    /**
     * Remove member from project
     */
    public void removeMemberFromProject(String projectId, String memberId, String requesterId) {
        // Check if requester is project Lead
        if (!projectService.isProjectLead(projectId, requesterId)) {
            throw new UnauthorizedException("Only project Lead can remove members");
        }

        // Find member
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project"));

        // Don't allow removing the Lead
        if (member.getProjectRole() == ProjectRole.LEAD) {
            throw new ConflictException("Cannot remove project Lead");
        }

        memberRepository.delete(member);
    }

    /**
     * Leave project
     */
    public void leaveProject(String projectId, String userId) {
        // Find member
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this project"));

        // Don't allow Lead to leave
        if (member.getProjectRole() == ProjectRole.LEAD) {
            throw new ConflictException("Project Lead cannot leave the project. Transfer Leadship first or delete the project.");
        }

        memberRepository.delete(member);
    }

    /**
     * Update member role
     */
    public ProjectMember updateMemberRole(String projectId, String memberId, ProjectRole newRole, String requesterId) {
        // Check if requester is project Lead
        if (!projectService.isProjectLead(projectId, requesterId)) {
            throw new UnauthorizedException("Only project Lead can update member roles");
        }

        // Find member
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project"));

        // Don't allow changing Lead role
        if (member.getProjectRole() == ProjectRole.LEAD || newRole == ProjectRole.LEAD) {
            throw new ConflictException("Cannot change Lead role through this endpoint");
        }

        member.setRole(newRole);
        return memberRepository.save(member);
    }

    /**
     * Get project invitations
     */
    public Page<ProjectInvitation> getProjectInvitations(String projectId, Pageable pageable) {
        // Corrected method name to use 'CreatedAt'
        return invitationRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable);
    }

    /**
     * Get user invitations
     */
    public Page<ProjectInvitationResponse> getUserInvitations(String userId, InvitationStatus status, Pageable pageable) {

        // 2. Fetch the data from the repository as a Page of entities.
        Page<ProjectInvitation> invitationsPage = invitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);

        // 3. Use the built-in .map() function of the Page object to convert entities to DTOs.
        // This is efficient and ensures the mapping happens within the transaction.
        return invitationsPage.map(ProjectInvitationResponse::new);
    }

    /**
     * Get pending invitations for user
     */
    public Page<ProjectInvitation> getPendingInvitationsForUser(String userId, Pageable pageable) {
        // Corrected method call to use the standard JPA method and pass the PENDING status
        return invitationRepository.findByInvitedUserIdAndStatus(userId, InvitationStatus.PENDING, pageable);
    }

    /**
     * Cancel invitation
     */
    public void cancelInvitation(Long invitationId, String requesterId) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Check if requester is the one who sent the invitation or project Lead
        if (!invitation.getInvitedBy().getId().equals(requesterId) &&
                !projectService.isProjectLead(invitation.getProject().getId(), requesterId)) {
            throw new UnauthorizedException("You can only cancel invitations you sent or if you're the project Lead");
        }

        // Check if invitation is still pending
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("Can only cancel pending invitations");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRespondedAt(LocalDateTime.now());

        invitationRepository.save(invitation);
    }


    /**
     * Get project members
     */
    public List<ProjectMemberResponse> getProjectMembers(String projectId, String currentUserId) {
        // Permission check: only members can view the member list
        if (!projectService.isProjectMember(projectId, currentUserId)) {
            throw new UnauthorizedException("Only project members can view the member list.");
        }

        List<ProjectMember> members = memberRepository.findByProject_IdOrderByCreatedAtAsc(projectId);

        // Map entities to DTOs here, inside the transactional method
        return members.stream()
                .map(member -> modelMapper.map(member, ProjectMemberResponse.class))
                .collect(Collectors.toList());
    }

    /**
     * Get user's project memberships
     */
    public List<ProjectMember> getUserProjectMemberships(String userId) {
        return memberRepository.findByUserId(userId);
    }
}