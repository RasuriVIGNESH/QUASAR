package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.response.Project.ProjectJoinRequestResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * FIX: Return ProjectJoinRequestResponse (DTO) instead of the raw entity.
     * Mapping happens here, inside the @Transactional boundary, so accessing
     * joinRequest.getProject().getProjectSkills() is safe — the Hibernate
     * session is still open.
     *
     * The caller (JoinRequestController) simply wraps the DTO in ApiResponse.
     */
    @Transactional
    public ProjectJoinRequestResponse sendJoinRequest(String projectId, String userId, String message) {
        // findById already uses JOIN FETCH for lead/category/event
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

        // Map to DTO inside the transaction — projectSkills are accessible here.
        return new ProjectJoinRequestResponse(savedRequest);
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

        ProjectMember member = new ProjectMember(project, request.getUser(), ProjectRole.MEMBER);
        memberRepository.save(member);

        joinRequestRepository.save(request);
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
        joinRequestRepository.delete(request);
    }

    public List<ProjectJoinRequestResponse> getProjectJoinRequests(
            String projectId,
            String userId) {

        Project project = projectService.findById(projectId);

        if (!project.isLead(userId)) {
            throw new UnauthorizedException(
                    "Only the project Lead can view join requests."
            );
        }

        return joinRequestRepository
                .findByProjectIdWithAssociations(projectId)
                .stream()
                .map(ProjectJoinRequestResponse::new)
                .toList();
    }

    public List<ProjectJoinRequest> getUserJoinRequests(String userId) {
        return joinRequestRepository.findByUserIdWithAssociations(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectJoinRequestResponse> getMyRequests(
            String userId,
            Pageable pageable) {

        List<ProjectJoinRequest> requests =
                joinRequestRepository.findMyRequests(userId);

        List<ProjectJoinRequestResponse> responses =
                requests.stream()
                        .map(ProjectJoinRequestResponse::new)
                        .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());

        List<ProjectJoinRequestResponse> pageContent =
                start >= responses.size()
                        ? java.util.Collections.emptyList()
                        : responses.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(
                pageContent,
                pageable,
                responses.size()
        );
    }
    private ProjectJoinRequest findById(Long requestId) {
        return joinRequestRepository.findByIdWithAssociations(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found with ID: " + requestId));
    }
}