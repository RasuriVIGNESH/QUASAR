package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.*;
import com.ADP.peerConnect.repository.*;
import com.ADP.peerConnect.service.Interface.iProjectInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for Project Invitation operations
 */
@Service
@Transactional
public class ProjectInvitationService implements iProjectInvitationService {

    @Autowired
    private ProjectInvitationRepository projectInvitationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    /**
     * Send project invitation
     */
    public ProjectInvitation sendInvitation(String projectId, String invitedUserId,
                                            String message, ProjectRole role, String inviterId) {
        // Validate project exists and sender has permission
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Check if inviter is project Lead or has permission
        if (!project.getLead().getId().equals(inviterId)) {
            throw new UnauthorizedException("Only project Lead can send invitations");
        }

        // Get users
        User inviter = userService.findById(inviterId);
        User invitedUser = userService.findById(invitedUserId);

        // Check if user is already a member
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, invitedUserId)) {
            throw new ConflictException("User is already a project member");
        }

        // Check if invitation already exists
        if (projectInvitationRepository.existsByProjectIdAndInvitedUserIdAndStatus(
                projectId, invitedUserId, InvitationStatus.PENDING)) {
            throw new ConflictException("Pending invitation already exists");
        }

        // Check if project has available spots
        long currentMembers = projectMemberRepository.countByProjectId(projectId);
        if (currentMembers >= project.getMaxTeamSize()) {
            throw new ConflictException("Project is at maximum capacity");
        }

        // Create invitation
        ProjectInvitation invitation = new ProjectInvitation();
        invitation.setProject(project);
        invitation.setInvitedBy(inviter);
        invitation.setInvitedUser(invitedUser);
        invitation.setMessage(message);
        invitation.setRole(role);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setInvitedAt(LocalDateTime.now());

        return projectInvitationRepository.save(invitation);
    }

    /**
     * Accept invitation
     */
    public void acceptInvitation(Long invitationId, String userId) {
        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Validate invitation belongs to user
        if (!invitation.getInvitedUser().getId().equals(userId)) {
            throw new UnauthorizedException("Cannot accept invitation for another user");
        }

        // Check if invitation is still pending
        if (!invitation.isPending()) {
            throw new ConflictException("Invitation is no longer pending");
        }

        // Check if project still has space
        Project project = invitation.getProject();
        long currentMembers = projectMemberRepository.countByProjectId(project.getId());
        if (currentMembers >= project.getMaxTeamSize()) {
            throw new ConflictException("Project is now at maximum capacity");
        }

        // Accept invitation
        invitation.accept();
        projectInvitationRepository.save(invitation);

        // Add user as project member
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(invitation.getInvitedUser());
        member.setRole(invitation.getRole());
        projectMemberRepository.save(member);
    }

    /**
     * Reject invitation
     */
    public void rejectInvitation(Long invitationId, String userId) {
        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Validate invitation belongs to user
        if (!invitation.getInvitedUser().getId().equals(userId)) {
            throw new UnauthorizedException("Cannot reject invitation for another user");
        }

        // Check if invitation is still pending
        if (!invitation.isPending()) {
            throw new ConflictException("Invitation is no longer pending");
        }

        // Reject invitation
        invitation.reject();
        projectInvitationRepository.save(invitation);
    }

    /**
     * Get project invitations (for project Lead)
     */
    public List<ProjectInvitation> getProjectInvitations(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Check if user is project Lead
        if (!project.getLead().getId().equals(userId)) {
            throw new UnauthorizedException("Only project Lead can view invitations");
        }

        return projectInvitationRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    /**
     * Get user invitations (for invited users)
     */
    public List<ProjectInvitation> getUserInvitations(String userId, Pageable pageable) {
        return projectInvitationRepository.findByInvitedUserIdOrderByCreatedAtDesc(userId, pageable).getContent();
    }

    /**
     * Get pending invitations for user
     */
    public List<ProjectInvitation> getPendingInvitations(String userId, Pageable pageable) {
        return projectInvitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, InvitationStatus.PENDING, pageable).getContent();
    }

    /**
     * Cancel invitation (by project Lead)
     */
    public void cancelInvitation(Long invitationId, String userId) {
        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Check if user is project Lead
        if (!invitation.getProject().getLead().getId().equals(userId)) {
            throw new UnauthorizedException("Only project Lead can cancel invitations");
        }

        // Check if invitation is still pending
        if (!invitation.isPending()) {
            throw new ConflictException("Can only cancel pending invitations");
        }

        projectInvitationRepository.delete(invitation);
    }
}