package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectRecommendedCandidate;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.repository.ProjectRecommendedCandidateRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectRecommendationService {

    @Autowired
    private ProjectRecommendedCandidateRepository repo;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public ProjectRecommendedCandidate addRecommendation(String projectId, String userId, Float score, Integer priority, String[] missingSkills) {
        // validate project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (repo.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ConflictException("Recommendation already exists for this user and project");
        }

        ProjectRecommendedCandidate c = new ProjectRecommendedCandidate();
        c.setProject(project);
        c.setUser(user);
        c.setMatchScore(score);
        c.setPriority(priority);
        c.setMissingSkills(missingSkills);

        return repo.save(c);
    }

    public List<ProjectRecommendedCandidate> getRecommendationsForProject(String projectId) {
        return repo.findByProjectId(projectId);
    }
}
