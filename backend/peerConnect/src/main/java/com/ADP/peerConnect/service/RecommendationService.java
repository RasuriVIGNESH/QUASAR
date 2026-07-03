package com.ADP.peerConnect.service;


import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRecommendationRepo;
import com.ADP.peerConnect.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService{

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final UserRecommendationRepo UserRecommendationRepo;

    @Autowired
    public RecommendationService(UserRepository userRepository, ProjectRepository projectRepository, UserRecommendationRepo userRecommendationRepo) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        UserRecommendationRepo = userRecommendationRepo;
    }

    @Transactional(readOnly = true)
    public List<UserRecommendedProject> getRecommendedProjects(String userId) {
        validateUserExists(userId);
        return UserRecommendationRepo.findByUserIdWithProject(userId);
    }

    @Transactional(readOnly = true)
    public List<UserRecommendedProject> getTopRecommendations(String userId) {
        validateUserExists(userId);
        List<UserRecommendedProject> allRecommendations =
                UserRecommendationRepo.findByUserIdWithProjectOrderByPriorityDesc(userId);
        return allRecommendations.stream()
                .collect(Collectors.toList());
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

//    public Set<Project> addRecommendation(String userId, String projectId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
//
//        user.addRecommendedProject(project);
//        userRepository.save(user);
//
//        return new HashSet<>(user.getRecommendedProjects());
//    }
//
//    public Set<Project> addMultipleRecommendations(String userId, Set<String> projectIds) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        Set<Project> projects = new HashSet<>();
//        for (String projectId : projectIds) {
//            Project project = projectRepository.findById(projectId)
//                    .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
//            projects.add(project);
//        }
//
//        projects.forEach(user::addRecommendedProject);
//        userRepository.save(user);
//
//        return new HashSet<>(user.getRecommendedProjects());
//    }
//
//    public Set<Project> removeRecommendation(String userId, String projectId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
//
//        user.removeRecommendedProject(project);
//        userRepository.save(user);
//
//        return new HashSet<>(user.getRecommendedProjects());
//    }
//
//    public void clearAllRecommendations(String userId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        user.getRecommendedProjects().clear();
//        userRepository.save(user);
//    }
//
//    public Set<Project> replaceAllRecommendations(String userId, Set<String> projectIds) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        // Clear existing recommendations
//        user.getRecommendedProjects().clear();
//
//        // Add new recommendations
//        Set<Project> projects = new HashSet<>();
//        for (String projectId : projectIds) {
//            Project project = projectRepository.findById(projectId)
//                    .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
//            projects.add(project);
//        }
//
//        projects.forEach(user::addRecommendedProject);
//        userRepository.save(user);
//
//        return new HashSet<>(user.getRecommendedProjects());
//    }
//
//    @Override
//    public List<UserRecommendedProject> addRecommendation(String userId, String projectId, Integer priority) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
//
//        // Check if recommendation already exists
//        UserRecommendedProjectId id = new UserRecommendedProjectId(userId, projectId);
//        if (recommendationRepository.existsById(id)) {
//            throw new IllegalStateException("Recommendation already exists for this user and project");
//        }
//
//        UserRecommendedProject recommendation = new UserRecommendedProject(user, project, priority);
//        recommendationRepository.save(recommendation);
//
//        return recommendationRepository.findByUserIdWithProjectOrderByPriorityDesc(userId);
//    }
//
//    @Override
//    public List<UserRecommendedProject> addMultipleRecommendations(
//            String userId, List<ProjectRecommendationDTO> recommendations) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        for (ProjectRecommendationDTO recDto : recommendations) {
//            Project project = projectRepository.findById(recDto.getProjectId())
//                    .orElseThrow(() -> new EntityNotFoundException(
//                            "Project not found with id: " + recDto.getProjectId()));
//
//            UserRecommendedProjectId id = new UserRecommendedProjectId(userId, recDto.getProjectId());
//            if (!recommendationRepository.existsById(id)) {
//                UserRecommendedProject recommendation = new UserRecommendedProject(
//                        user, project, recDto.getPriority());
//                recommendationRepository.save(recommendation);
//            }
//        }
//
//        return recommendationRepository.findByUserIdWithProjectOrderByPriorityDesc(userId);
//    }
//
//    @Override
//    public UserRecommendedProject updateRecommendationPriority(
//            String userId, String projectId, Integer newPriority) {
//        UserRecommendedProjectId id = new UserRecommendedProjectId(userId, projectId);
//        UserRecommendedProject recommendation = recommendationRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException(
//                        "Recommendation not found for user: " + userId + " and project: " + projectId));
//
//        recommendation.setPriority(newPriority);
//        return recommendationRepository.save(recommendation);
//    }
//
//    @Override
//    public void removeRecommendation(String userId, String projectId) {
//        validateUserExists(userId);
//        validateProjectExists(projectId);
//
//        recommendationRepository.deleteByUserIdAndProjectId(userId, projectId);
//    }
//
//    @Override
//    public void clearAllRecommendations(String userId) {
//        validateUserExists(userId);
//        recommendationRepository.deleteByUserId(userId);
//    }
//
//    @Override
//    public List<UserRecommendedProject> replaceAllRecommendations(
//            String userId, List<ProjectRecommendationDTO> recommendations) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
//
//        // Clear existing recommendations
//        recommendationRepository.deleteByUserId(userId);
//
//        // Add new recommendations
//        for (ProjectRecommendationDTO recDto : recommendations) {
//            Project project = projectRepository.findById(recDto.getProjectId())
//                    .orElseThrow(() -> new EntityNotFoundException(
//                            "Project not found with id: " + recDto.getProjectId()));
//
//            UserRecommendedProject recommendation = new UserRecommendedProject(
//                    user, project, recDto.getPriority());
//            recommendationRepository.save(recommendation);
//        }
//
//        return recommendationRepository.findByUserIdWithProjectOrderByPriorityDesc(userId);
//    }
}