package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.dto.response.RecommendationFeedbackResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.RecommendationFeedback;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.RecommendationFeedbackRepository;
import com.ADP.peerConnect.repository.TeamRepo;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationFeedbackCompanionService {
    private static final int MAX_PAGE_SIZE = 50;
    private final RecommendationFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepo teamRepository;

    public RecommendationFeedbackCompanionService(RecommendationFeedbackRepository feedbackRepository,
                                                  UserRepository userRepository,
                                                  ProjectRepository projectRepository,
                                                  TeamRepo teamRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional
    public RecommendationFeedbackResponse saveProjectFeedback(String actorId, String projectId, FeedbackAction action) {
        User actor = findUser(actorId, "Actor not found");
        if (actor.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Student account required to provide project recommendation feedback");
        }
        return save(actor, findProject(projectId), null, action);
    }

    @Transactional
    public RecommendationFeedbackResponse saveCandidateFeedback(String actorId, String projectId,
                                                                 String candidateId, FeedbackAction action) {
        Project project = findProject(projectId);
        if (!Boolean.TRUE.equals(teamRepository.isLead(projectId, actorId))) {
            throw new ForbiddenException("Only the project lead can provide candidate feedback");
        }
        if (actorId.equals(candidateId)) {
            throw new BadRequestException("A user cannot provide feedback on their own candidate card");
        }
        User actor = findUser(actorId, "Actor not found");
        User candidate = findUser(candidateId, "Candidate not found");
        return save(actor, project, candidate, action);
    }

    @Transactional(readOnly = true)
    public Page<RecommendationFeedbackResponse> getSavedProjects(String studentId, int page, int size) {
        validatePage(page, size);
        User student = findUser(studentId, "Student not found");
        if (student.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Student account required to view saved projects");
        }
        return feedbackRepository.findByActorIdAndCandidateUserIsNullAndActionOrderByUpdatedAtDesc(
                studentId, FeedbackAction.SAVED, PageRequest.of(page, size)).map(RecommendationFeedbackResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<RecommendationFeedbackResponse> getSavedCandidates(String actorId, String projectId, int page, int size) {
        validatePage(page, size);
        findProject(projectId);
        if (!Boolean.TRUE.equals(teamRepository.isLead(projectId, actorId))) {
            throw new ForbiddenException("Only the project lead can view saved candidates");
        }
        return feedbackRepository.findByActorIdAndProjectIdAndActionOrderByUpdatedAtDesc(
                actorId, projectId, FeedbackAction.SAVED, PageRequest.of(page, size)).map(RecommendationFeedbackResponse::from);
    }

    private RecommendationFeedbackResponse save(User actor, Project project, User candidate, FeedbackAction action) {
        if (action == null) throw new BadRequestException("Feedback action is required");
        RecommendationFeedback feedback = candidate == null
                ? feedbackRepository.findByActorIdAndProjectIdAndCandidateUserIsNull(actor.getId(), project.getId()).orElse(null)
                : feedbackRepository.findByActorIdAndProjectIdAndCandidateUserId(
                        actor.getId(), project.getId(), candidate.getId()).orElse(null);
        if (feedback == null) {
            feedback = new RecommendationFeedback(actor, project, candidate, action);
        } else {
            feedback.setAction(action);
        }
        return RecommendationFeedbackResponse.from(feedbackRepository.save(feedback));
    }

    private User findUser(String id, String message) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(message));
    }

    private Project findProject(String id) {
        return projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private void validatePage(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("page must be >= 0 and size must be between 1 and " + MAX_PAGE_SIZE);
        }
    }
}
