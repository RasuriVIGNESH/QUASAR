package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.service.Interface.iRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class RecommendationServiceImpl implements iRecommendationService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public RecommendationServiceImpl(UserRepository userRepository, ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Project> getRecommendedProjects(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        return new HashSet<>(user.getRecommendedProjects());
    }

    @Override
    public Set<Project> addRecommendation(String userId, String projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        user.addRecommendedProject(project);
        userRepository.save(user);

        return new HashSet<>(user.getRecommendedProjects());
    }

    @Override
    public Set<Project> addMultipleRecommendations(String userId, Set<String> projectIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Set<Project> projects = new HashSet<>();
        for (String projectId : projectIds) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
            projects.add(project);
        }

        projects.forEach(user::addRecommendedProject);
        userRepository.save(user);

        return new HashSet<>(user.getRecommendedProjects());
    }

    @Override
    public Set<Project> removeRecommendation(String userId, String projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        user.removeRecommendedProject(project);
        userRepository.save(user);

        return new HashSet<>(user.getRecommendedProjects());
    }

    @Override
    public void clearAllRecommendations(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.getRecommendedProjects().clear();
        userRepository.save(user);
    }

    @Override
    public Set<Project> replaceAllRecommendations(String userId, Set<String> projectIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Clear existing recommendations
        user.getRecommendedProjects().clear();

        // Add new recommendations
        Set<Project> projects = new HashSet<>();
        for (String projectId : projectIds) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
            projects.add(project);
        }

        projects.forEach(user::addRecommendedProject);
        userRepository.save(user);

        return new HashSet<>(user.getRecommendedProjects());
    }
}