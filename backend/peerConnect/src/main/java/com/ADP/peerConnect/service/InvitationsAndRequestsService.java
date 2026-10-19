package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse;
import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectRole;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.NotificationEventType;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.repository.InvitationsAndRequestsRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InvitationsAndRequestsService {
    @PersistenceContext
    private EntityManager entityManager;

    private final InvitationsAndRequestsRepository repository;
    private final TeamService teamService;
    private final UserService userService;
    private final ProjectService projectService;
    private final ProjectRoleService projectRoleService;
    private final InboxNotificationService notificationService;
    private final CollaborationRequestLifecycleService requestLifecycleService;

    public InvitationsAndRequestsService(InvitationsAndRequestsRepository repository,
                                         TeamService teamService,
                                         UserService userService,
                                         ProjectService projectService,
                                         ProjectRoleService projectRoleService,
                                         InboxNotificationService notificationService,
                                         CollaborationRequestLifecycleService requestLifecycleService) {
        this.repository = repository;
        this.teamService = teamService;
        this.userService = userService;
        this.projectService = projectService;
        this.projectRoleService = projectRoleService;
        this.notificationService = notificationService;
        this.requestLifecycleService = requestLifecycleService;
    }

    /** Project lead -> student. A role is required when the project has open roles. */
    public InvitationsAndRequestsResponse sendInvitation(String projectId, String invitedUserId,
                                                          String message, String inviterId,
                                                          Long roleId) {
        Project project = projectService.lockForMembershipUpdate(projectId);
        requireRecruitingAndCapacity(project);
        if (!teamService.isLead(projectId, inviterId)) {
            throw new ForbiddenException("Only the project lead can send invitations.");
        }
        if (inviterId.equals(invitedUserId)) {
            throw new ConflictException("You cannot invite yourself to your own project.");
        }
        if (teamService.isProjectMember(projectId, invitedUserId)) {
            throw new ConflictException("This student is already a project member.");
        }
        requireNoPendingCollaboration(projectId, invitedUserId);

        ProjectRole role = projectRoleService.requireOpenRole(projectId, roleId);
        User inviter = userService.findById(inviterId);
        User invitedUser = userService.findById(invitedUserId);
        if (invitedUser.getRole() != Role.STUDENT) {
            throw new ConflictException("Only student accounts can be invited to a project team.");
        }

        InvitationsAndRequests invitation = new InvitationsAndRequests();
        invitation.createInvitation(project, inviter, invitedUser, cleanMessage(message));
        invitation.setProjectRole(role);
        InvitationsAndRequests saved = repository.save(invitation);

        String roleText = role == null ? "" : " for the " + role.getName() + " role";
        notificationService.create(invitedUser.getId(), NotificationEventType.PROJECT_INVITATION,
                "Project invitation", displayName(inviter) + " invited you to join " + project.getTitle()
                        + roleText + ".", projectId, inviterId);
        return new InvitationsAndRequestsResponse(saved);
    }

    /** Inviter or project lead cancels a pending invitation. History is retained. */
    public void cancelInvitation(Long invitationId, String requesterId) {
        InvitationsAndRequests invitation = findInvitationById(invitationId);
        boolean isInviter = invitation.getInitiatedBy() != null
                && invitation.getInitiatedBy().getId().equals(requesterId);
        if (!isInviter && !teamService.isLead(invitation.getProject().getId(), requesterId)) {
            throw new ForbiddenException("Only the inviter or project lead can cancel this invitation.");
        }
        if (!invitation.isPending()) {
            throw new ConflictException("Only a pending invitation can be cancelled.");
        }
        Project project = projectService.findById(invitation.getProject().getId());
        invitation.cancel();
        String invitedUserId = invitation.getTargetUser().getId();
        notificationService.create(invitedUserId, NotificationEventType.REQUEST_DECISION,
                "Project invitation cancelled", "The invitation to join " + project.getTitle() + " was cancelled.",
                project.getId(), requesterId);
    }

    /** Student -> recruiting project. Existing raw-string body is retained for compatibility; roleId is a query parameter. */
    public InvitationsAndRequestsResponse sendJoinRequest(String projectId, String userId,
                                                           String message, Long roleId) {
        Project project = projectService.lockForMembershipUpdate(projectId);
        requireRecruitingAndCapacity(project);
        if (teamService.isProjectMember(projectId, userId)) {
            throw new ConflictException("You are already a member of this project.");
        }
        requireNoPendingCollaboration(projectId, userId);

        ProjectRole role = projectRoleService.requireOpenRole(projectId, roleId);
        User user = userService.findById(userId);
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only student accounts can request to join a project.");
        }
        InvitationsAndRequests request = new InvitationsAndRequests();
        request.createJoinRequest(project, user, cleanMessage(message));
        request.setProjectRole(role);
        InvitationsAndRequests saved = repository.save(request);

        User lead = project.getTeam().getLead();
        String roleText = role == null ? "" : " for the " + role.getName() + " role";
        notificationService.create(lead.getId(), NotificationEventType.JOIN_REQUEST,
                "New join request", displayName(user) + " requested to join " + project.getTitle()
                        + roleText + ".", projectId, userId);
        return new InvitationsAndRequestsResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getUserInvitations(String userId, Pageable pageable) {
        return repository.findByTargetUserIdAndTypeWithAssociations(userId, RequestType.INVITATION, pageable)
                .map(InvitationsAndRequestsResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getUserInvitationsByStatus(String userId, Status status,
                                                                           Pageable pageable) {
        return repository.findByTargetUserIdAndTypeAndStatusWithAssociations(
                        userId, RequestType.INVITATION, status, pageable)
                .map(InvitationsAndRequestsResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getUserJoinRequests(String userId, Pageable pageable) {
        return repository.findByTargetUserIdAndTypeWithAssociations(userId, RequestType.JOIN_REQUEST, pageable)
                .map(InvitationsAndRequestsResponse::new);
    }

    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getProjectJoinRequests(String projectId, String userId,
                                                                        Pageable pageable) {
        if (!teamService.isLead(projectId, userId)) {
            throw new ForbiddenException("Only the project lead can review join requests.");
        }
        projectService.findById(projectId);
        return repository.findByProjectIdAndTypeWithAssociations(projectId, RequestType.JOIN_REQUEST, pageable)
                .map(InvitationsAndRequestsResponse::new);
    }

    /** Project lead accepts a join request; invited student accepts an invitation. */
    public void accept(Long requestId, String currentUserId) {
        InvitationsAndRequests request = findRequestForRead(requestId);
        validateDecisionActor(request, currentUserId);
        Project project = projectService.lockForMembershipUpdate(request.getProject().getId());
        request = findRequestById(requestId);
        validateDecisionActor(request, currentUserId);
        requirePending(request);
        requireRecruitingAndCapacity(project);

        String targetUserId = request.getTargetUser().getId();
        if (teamService.isProjectMember(project.getId(), targetUserId)) {
            throw new ConflictException("This student is already a project member.");
        }

        if (request.getProjectRole() == null && projectRoleService.hasRequiredRoles(project.getId())) {
            throw new ConflictException("This request does not specify a required role. Submit a new role-specific request.");
        }

        ProjectRole role = projectRoleService.lockOpenRole(project.getId(), request.getProjectRole());
        request.accept();
        if (role != null) role.setFilled(true);
        teamService.addMember(project.getId(), targetUserId);
        if (role != null) {
            requestLifecycleService.expireOtherRequestsForRole(project.getId(), role.getId(), request.getId(), currentUserId);
        }
        boolean recruitingClosed = project.getCurrentTeamSize() >= project.getMaxTeamSize()
                || (projectRoleService.hasRequiredRoles(project.getId())
                    && !projectRoleService.hasOpenRoles(project.getId()));
        if (recruitingClosed) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            requestLifecycleService.expireOtherRequestsForProject(project.getId(), request.getId(), currentUserId);
        }

        String notifyUserId = request.isJoinRequest()
                ? targetUserId
                : request.getInitiatedBy() == null ? null : request.getInitiatedBy().getId();
        notifyIfPresent(notifyUserId, NotificationEventType.REQUEST_DECISION,
                "Collaboration request accepted", "Your collaboration request for " + project.getTitle()
                        + " was accepted.", project.getId(), currentUserId);
    }

    /** Project lead rejects a join request; invited student rejects an invitation. */
    public void reject(Long requestId, String currentUserId) {
        InvitationsAndRequests request = findRequestById(requestId);
        validateDecisionActor(request, currentUserId);
        requirePending(request);
        Project project = projectService.findById(request.getProject().getId());
        request.reject();

        String notifyUserId = request.isJoinRequest()
                ? request.getTargetUser().getId()
                : request.getInitiatedBy() == null ? null : request.getInitiatedBy().getId();
        notifyIfPresent(notifyUserId, NotificationEventType.REQUEST_DECISION,
                "Collaboration request declined", "A collaboration request for "
                        + project.getTitle() + " was declined.",
                project.getId(), currentUserId);
    }

    /** Student withdraws their own pending join request. */
    public void cancelJoinRequest(Long requestId, String userId) {
        InvitationsAndRequests request = findRequestById(requestId);
        if (!request.isJoinRequest()) {
            throw new ResourceNotFoundException("Join request not found.");
        }
        if (!request.getTargetUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own join requests.");
        }
        requirePending(request);
        projectService.findById(request.getProject().getId());
        request.cancel();
        User lead = request.getProject().getTeam().getLead();
        notifyIfPresent(lead == null ? null : lead.getId(), NotificationEventType.REQUEST_DECISION,
                "Join request withdrawn", displayName(request.getTargetUser()) + " withdrew their request for "
                        + request.getProject().getTitle() + ".", request.getProject().getId(), userId);
    }

    private void validateDecisionActor(InvitationsAndRequests request, String actorId) {
        if (request.isJoinRequest()) {
            if (!teamService.isLead(request.getProject().getId(), actorId)) {
                throw new ForbiddenException("Only the project lead can accept or reject a join request.");
            }
        } else if (request.getTargetUser() == null || !request.getTargetUser().getId().equals(actorId)) {
            throw new ForbiddenException("Only the invited student can accept or reject this invitation.");
        }
    }

    private void requireRecruitingAndCapacity(Project project) {
        if (project.getStatus() != ProjectStatus.RECRUITING) {
            throw new ConflictException("This project is not recruiting new members.");
        }
        if (project.isFull()) {
            throw new ConflictException("This project's team is already full.");
        }
    }

    private void requireNoPendingCollaboration(String projectId, String userId) {
        if (repository.existsByProjectIdAndTargetUserIdAndStatus(projectId, userId, Status.PENDING)) {
            throw new ConflictException("A pending invitation or join request already exists for this student and project.");
        }
    }

    private void requirePending(InvitationsAndRequests request) {
        if (!request.isPending()) {
            throw new ConflictException("This request or invitation has already been responded to.");
        }
    }

    private InvitationsAndRequests findInvitationById(Long id) {
        InvitationsAndRequests entity = findRequestById(id);
        if (!entity.isInvitation()) throw new ResourceNotFoundException("Invitation not found.");
        return entity;
    }

    private InvitationsAndRequests findRequestById(Long id) {
        InvitationsAndRequests locked = repository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation or join request not found: " + id));
        entityManager.refresh(locked, LockModeType.PESSIMISTIC_WRITE);
        return findRequestForRead(id);
    }

    private InvitationsAndRequests findRequestForRead(Long id) {
        return repository.findByIdWithAssociations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation or join request not found: " + id));
    }

    private String cleanMessage(String message) {
        if (message == null) return null;
        String trimmed = message.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String displayName(User user) {
        if (user == null) return "A student";
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isEmpty() ? "A student" : name;
    }

    private void notifyIfPresent(String userId, NotificationEventType type, String title,
                                 String message, String projectId, String actorId) {
        if (userId != null && !userId.isBlank()) {
            notificationService.create(userId, type, title, message, projectId, actorId);
        }
    }
}
