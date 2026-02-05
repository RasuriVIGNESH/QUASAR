package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.dto.ProjectRecommendationDTO;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import com.ADP.peerConnect.model.entity.UserRecommendedProjectId;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRecommendedProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;

import com.ADP.peerConnect.service.Interface.RecommendationServiceWithPriority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationServiceWithPriorityImpl implements RecommendationServiceWithPriority {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final UserRecommendedProjectRepository recommendationRepository;

    @Autowired
    public RecommendationServiceWithPriorityImpl(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            UserRecommendedProjectRepository recommendationRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRecommendedProject> getRecommendedProjects(String userId) {
        validateUserExists(userId);
        return recommendationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRecommendedProject> getRecommendedProjectsByPriority(String userId) {
        validateUserExists(userId);
        return recommendationRepository.findByUserIdOrderByPriorityDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRecommendedProject> getTopRecommendations(String userId, int limit) {
        validateUserExists(userId);
        List<UserRecommendedProject> allRecommendations =
                recommendationRepository.findByUserIdOrderByPriorityDesc(userId);
        return allRecommendations.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserRecommendedProject> addRecommendation(String userId, String projectId, Integer priority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        // Check if recommendation already exists
        UserRecommendedProjectId id = new UserRecommendedProjectId(userId, projectId);
        if (recommendationRepository.existsById(id)) {
            throw new IllegalStateException("Recommendation already exists for this user and project");
        }

        UserRecommendedProject recommendation = new UserRecommendedProject(user, project, priority);
        recommendationRepository.save(recommendation);

        return recommendationRepository.findByUserIdOrderByPriorityDesc(userId);
    }

    @Override
    public List<UserRecommendedProject> addMultipleRecommendations(
            String userId, List<ProjectRecommendationDTO> recommendations) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        for (ProjectRecommendationDTO recDto : recommendations) {
            Project project = projectRepository.findById(recDto.getProjectId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Project not found with id: " + recDto.getProjectId()));

            UserRecommendedProjectId id = new UserRecommendedProjectId(userId, recDto.getProjectId());
            if (!recommendationRepository.existsById(id)) {
                UserRecommendedProject recommendation = new UserRecommendedProject(
                        user, project, recDto.getPriority());
                recommendationRepository.save(recommendation);
            }
        }

        return recommendationRepository.findByUserIdOrderByPriorityDesc(userId);
    }

    @Override
    public UserRecommendedProject updateRecommendationPriority(
            String userId, String projectId, Integer newPriority) {
        UserRecommendedProjectId id = new UserRecommendedProjectId(userId, projectId);
        UserRecommendedProject recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Recommendation not found for user: " + userId + " and project: " + projectId));

        recommendation.setPriority(newPriority);
        return recommendationRepository.save(recommendation);
    }

    @Override
    public void removeRecommendation(String userId, String projectId) {
        validateUserExists(userId);
        validateProjectExists(projectId);

        recommendationRepository.deleteByUserIdAndProjectId(userId, projectId);
    }

    @Override
    public void clearAllRecommendations(String userId) {
        validateUserExists(userId);
        recommendationRepository.deleteByUserId(userId);
    }

    @Override
    public List<UserRecommendedProject> replaceAllRecommendations(
            String userId, List<ProjectRecommendationDTO> recommendations) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Clear existing recommendations
        recommendationRepository.deleteByUserId(userId);

        // Add new recommendations
        for (ProjectRecommendationDTO recDto : recommendations) {
            Project project = projectRepository.findById(recDto.getProjectId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Project not found with id: " + recDto.getProjectId()));

            UserRecommendedProject recommendation = new UserRecommendedProject(
                    user, project, recDto.getPriority());
            recommendationRepository.save(recommendation);
        }

        return recommendationRepository.findByUserIdOrderByPriorityDesc(userId);
    }

    private void validateUserExists(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
    }

    private void validateProjectExists(String projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new EntityNotFoundException("Project not found with id: " + projectId);
        }
    }
}