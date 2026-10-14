package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse;
import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.repository.InvitationsAndRequestsRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InvitationsAndRequestsService {

    private final InvitationsAndRequestsRepository repository;
    private final TeamService teamService;
    private final UserService userService;
    private final ProjectService projectService;

    public InvitationsAndRequestsService(
            InvitationsAndRequestsRepository repository,
            TeamService teamService,
            UserService userService,
            ProjectService projectService
    ) {
        this.repository = repository;
        this.teamService = teamService;
        this.userService = userService;
        this.projectService = projectService;
    }

    // -------------------------------------------------------------------------
    // Send invitation: project member/lead -> user
    // -------------------------------------------------------------------------

    public InvitationsAndRequestsResponse sendInvitation(
            String projectId,
            String invitedUserId,
            String message,
            String inviterId
    ) {
        Project project = projectService.findById(projectId);

        if (!teamService.isProjectMember(projectId, inviterId)) {
            throw new UnauthorizedException(
                    "Only project members can send invitations"
            );
        }

        if (teamService.isProjectMember(projectId, invitedUserId)) {
            throw new ConflictException(
                    "User is already a project member"
            );
        }

        if (repository.existsByProjectIdAndTargetUserIdAndRequestTypeAndStatus(
                projectId,
                invitedUserId,
                RequestType.INVITATION,
                Status.PENDING
        )) {
            throw new ConflictException(
                    "Pending invitation already exists"
            );
        }

        if (project.getCurrentTeamSize() >= project.getMaxTeamSize()) {
            throw new ConflictException(
                    "Project is at maximum capacity"
            );
        }

        User inviter = userService.findById(inviterId);
        User invitedUser = userService.findById(invitedUserId);

        InvitationsAndRequests invitation =
                new InvitationsAndRequests();

        invitation.createInvitation(
                project,
                inviter,
                invitedUser,
                message
        );

        InvitationsAndRequests saved =
                repository.save(invitation);

        /*
         * The surrounding class-level transaction is still active here,
         * so the DTO can safely access the related fields.
         */
        return new InvitationsAndRequestsResponse(saved);
    }

    // -------------------------------------------------------------------------
    // Cancel invitation
    // -------------------------------------------------------------------------

    public void cancelInvitation(
            Long invitationId,
            String requesterId
    ) {
        InvitationsAndRequests invitation =
                repository.findByIdWithAssociations(invitationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invitation not found"
                                )
                        );

        if (invitation.getInitiatedBy() == null
                || (
                !invitation.getInitiatedBy()
                        .getId()
                        .equals(requesterId)
                        && !teamService.isLead(
                        invitation.getProject().getId(),
                        requesterId
                )
        )) {
            throw new UnauthorizedException(
                    "You can only cancel invitations you sent or if you are the project lead"
            );
        }

        if (!invitation.isPending()) {
            throw new ConflictException(
                    "Can only cancel pending invitations"
            );
        }

        repository.delete(invitation);
    }

    // -------------------------------------------------------------------------
    // Send join request: user -> project
    // -------------------------------------------------------------------------

    public InvitationsAndRequestsResponse sendJoinRequest(
            String projectId,
            String userId,
            String message
    ) {
        Project project = projectService.findById(projectId);
        User user = userService.findById(userId);

        if (project.getStatus() != ProjectStatus.RECRUITING) {
            throw new ConflictException(
                    "This project is not currently recruiting new members."
            );
        }

        if (project.isFull()) {
            throw new ConflictException(
                    "This project's team is already full."
            );
        }

        if (teamService.isProjectMember(projectId, userId)) {
            throw new ConflictException(
                    "You are already a member of this project."
            );
        }

        if (repository.existsByProjectIdAndTargetUserIdAndRequestTypeAndStatus(
                projectId,
                userId,
                RequestType.JOIN_REQUEST,
                Status.PENDING
        )) {
            throw new ConflictException(
                    "You already have a pending request to join this project."
            );
        }

        InvitationsAndRequests joinRequest =
                new InvitationsAndRequests();

        joinRequest.createJoinRequest(
                project,
                user,
                message
        );

        InvitationsAndRequests saved =
                repository.save(joinRequest);

        return new InvitationsAndRequestsResponse(saved);
    }

    // -------------------------------------------------------------------------
    // Read invitations for the current user
    // -------------------------------------------------------------------------

    /*
     * Returns invitations for the user, regardless of status.
     *
     * The repository query fetches:
     * - project
     * - targetUser
     * - initiatedBy
     *
     * The DTO is created while the transaction is active.
     */
    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getUserInvitations(
            String userId,
            Pageable pageable
    ) {
        return repository
                .findByTargetUserIdAndTypeWithAssociations(
                        userId,
                        RequestType.INVITATION,
                        pageable
                )
                .map(InvitationsAndRequestsResponse::new);
    }

    /*
     * Returns pending invitations for the user.
     *
     * This uses the repository method that filters by:
     * - target user
     * - request type
     * - status
     */
    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getPendingInvitations(
            String userId,
            Pageable pageable
    ) {
        return repository
                .findByTargetUserIdAndTypeAndStatusResponse(
                        userId,
                        RequestType.INVITATION,
                        Status.PENDING,
                        pageable
                );
    }


    // -------------------------------------------------------------------------
    // Read join requests for a project
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<InvitationsAndRequestsResponse> getProjectJoinRequests(
            String projectId,
            String userId,
            Pageable pageable
    ) {
        if (!teamService.isProjectMember(projectId, userId)) {
            throw new UnauthorizedException(
                    "Only project members can view join requests."
            );
        }

        return repository
                .findByProjectIdAndTypeWithAssociations(
                        projectId,
                        RequestType.JOIN_REQUEST,
                        pageable
                )
                .map(InvitationsAndRequestsResponse::new);
    }

    // -------------------------------------------------------------------------
    // Internal lookup methods
    // -------------------------------------------------------------------------

    private InvitationsAndRequests findInvitationById(Long id) {
        InvitationsAndRequests entity =
                repository.findByIdWithAssociations(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invitation not found"
                                )
                        );

        if (!entity.isInvitation()) {
            throw new ResourceNotFoundException(
                    "Invitation not found"
            );
        }

        return entity;
    }

    private InvitationsAndRequests findRequestById(Long id) {
        return repository.findByIdWithAssociations(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invitation or join request not found with ID: "
                                        + id
                        )
                );
    }

    // -------------------------------------------------------------------------
    // Accept invitation or join request
    // -------------------------------------------------------------------------

    public void accept(
            Long requestId,
            String currentUserId
    ) {
        InvitationsAndRequests request =
                findRequestById(requestId);

        Project project = request.getProject();

        if (!request.isPending()) {
            throw new ConflictException(
                    "This request has already been responded to."
            );
        }

        if (project.isFull()) {
            throw new ConflictException(
                    "Cannot accept, the project team is now full."
            );
        }

        if (request.isJoinRequest()) {
            if (!teamService.isProjectMember(
                    project.getId(),
                    currentUserId
            )) {
                throw new UnauthorizedException(
                        "Only project members can accept join requests."
                );
            }
        } else {
            if (!request.getTargetUser()
                    .getId()
                    .equals(currentUserId)) {
                throw new UnauthorizedException(
                        "Only the invited user can accept this invitation."
                );
            }
        }

        request.accept();
        repository.save(request);

        teamService.addMember(
                project.getId(),
                request.getTargetUser().getId()
        );

        if (project.getCurrentTeamSize()
                >= project.getMaxTeamSize()) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }
    }

    // -------------------------------------------------------------------------
    // Reject invitation or join request
    // -------------------------------------------------------------------------

    public void reject(
            Long requestId,
            String currentUserId
    ) {
        InvitationsAndRequests request =
                findRequestById(requestId);

        if (!request.isPending()) {
            throw new ConflictException(
                    "This request has already been responded to."
            );
        }

        if (request.isJoinRequest()) {
            if (!teamService.isProjectMember(
                    request.getProject().getId(),
                    currentUserId
            )) {
                throw new UnauthorizedException(
                        "Only project members can reject join requests."
                );
            }
        } else {
            if (!request.getTargetUser()
                    .getId()
                    .equals(currentUserId)) {
                throw new UnauthorizedException(
                        "Only the invited user can reject this invitation."
                );
            }
        }

        request.reject();
        repository.save(request);
    }

    // -------------------------------------------------------------------------
    // Cancel join request
    // -------------------------------------------------------------------------

    public void cancelJoinRequest(
            Long requestId,
            String userId
    ) {
        InvitationsAndRequests request =
                findRequestById(requestId);

        if (!request.getTargetUser()
                .getId()
                .equals(userId)) {
            throw new UnauthorizedException(
                    "You can only cancel your own join requests."
            );
        }

        if (!request.isPending()) {
            throw new ConflictException(
                    "This join request has already been responded to and cannot be canceled."
            );
        }

        repository.delete(request);
    }
}
