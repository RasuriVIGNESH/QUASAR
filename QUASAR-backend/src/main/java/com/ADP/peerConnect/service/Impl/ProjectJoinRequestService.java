package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.ProjectJoinRequestRepository;
import com.ADP.peerConnect.repository.ProjectMemberRepository;
import com.ADP.peerConnect.service.Interface.iProjectJoinRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProjectJoinRequestService implements iProjectJoinRequestService {

    @Autowired
    private ProjectJoinRequestRepository joinRequestRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectMemberRepository memberRepository;

    // TODO: Inject NotificationService when it's ready
    // @Autowired
    // private NotificationService notificationService;

    /**
     * A user sends a request to join a project.
     */
    public ProjectJoinRequest sendJoinRequest(String projectId, String userId, String message) {
        Project project = projectService.findById(projectId);
        User user = userService.findById(userId);

        // Validation checks
        if (project.getStatus() != ProjectStatus.RECRUITING) {
            throw new ConflictException("This project is not currently recruiting new members.");
        }
        if (project.isFull()) {
            throw new ConflictException("This project's team is already full.");
        }
        if (projectService.isProjectMember(projectId, userId)) {
            throw new ConflictException("You are already a member of this project.");
        }
        if (joinRequestRepository.existsByProjectIdAndUserIdAndStatus(projectId, userId, InvitationStatus.PENDING)) {
            throw new ConflictException("You already have a pending request to join this project.");
        }

        ProjectJoinRequest joinRequest = new ProjectJoinRequest();
        joinRequest.setProject(project);
        joinRequest.setUser(user);
        joinRequest.setMessage(message);
        joinRequest.setStatus(InvitationStatus.PENDING);

        ProjectJoinRequest savedRequest = joinRequestRepository.save(joinRequest);

        // TODO: Notify project Lead [cite: 312]
        // notificationService.createNotification(project.getLead(), "New join request for " + project.getTitle());

        return savedRequest;
    }

    /**
     * The project Lead accepts a join request.
     */
    public void acceptJoinRequest(Long requestId, String LeadId) {
        ProjectJoinRequest request = findById(requestId);
        Project project = request.getProject();

        if (!project.isLead(LeadId)) {
            throw new UnauthorizedException("Only the project Lead can accept join requests.");
        }
        if (request.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("This join request has already been responded to.");
        }
        if (project.isFull()) {
            throw new ConflictException("Cannot accept request, the project team is now full.");
        }

        request.setStatus(InvitationStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());

        // Add the user as a new project member
        ProjectMember member = new ProjectMember(project, request.getUser(), ProjectRole.MEMBER);
        memberRepository.save(member);

        joinRequestRepository.save(request);

        // TODO: Notify the requester that their request was accepted [cite: 313]
        // notificationService.createNotification(request.getUser(), "Your request to join " + project.getTitle() + " has been accepted!");
    }

    /**
     * The project Lead rejects a join request.
     */
    public void rejectJoinRequest(Long requestId, String LeadId) {
        ProjectJoinRequest request = findById(requestId);
        if (!request.getProject().isLead(LeadId)) {
            throw new UnauthorizedException("Only the project Lead can reject join requests.");
        }
        if (request.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("This join request has already been responded to.");
        }

        request.setStatus(InvitationStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        joinRequestRepository.save(request);

        // TODO: Notify the requester [cite: 314]
        // notificationService.createNotification(request.getUser(), "Your request to join " + request.getProject().getTitle() + " has been rejected.");
    }

    /**
     * The user who sent the request cancels it.
     */
    public void cancelJoinRequest(Long requestId, String userId) {
        ProjectJoinRequest request = findById(requestId);
        if (!request.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only cancel your own join requests.");
        }
        if (request.getStatus() != InvitationStatus.PENDING) {
            throw new ConflictException("This join request has already been responded to and cannot be canceled.");
        }

        // We can either delete it or set status to CANCELED. Deleting is cleaner.
        joinRequestRepository.delete(request);
    }

    public List<ProjectJoinRequest> getProjectJoinRequests(String projectId, String userId) {
        Project project = projectService.findById(projectId);
        if (!project.isLead(userId)) {
            throw new UnauthorizedException("Only the project Lead can view join requests.");
        }
        return joinRequestRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public List<ProjectJoinRequest> getUserJoinRequests(String userId) {
        return joinRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private ProjectJoinRequest findById(Long requestId) {
        return joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with ID: " + requestId));
    }
}