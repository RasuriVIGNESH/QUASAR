package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.dto.response.ProjectDiscoverableDetailResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.ProjectSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProjectDiscoveryService {
    private final ProjectRepository projectRepository;
    private final ProjectSkillRepository projectSkillRepository;

    public ProjectDiscoveryService(ProjectRepository projectRepository, ProjectSkillRepository projectSkillRepository) {
        this.projectRepository = projectRepository;
        this.projectSkillRepository = projectSkillRepository;
    }

    public ProjectDiscoverableDetailResponse getDiscoverableDetails(String projectId) {
        Project project = projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        List<ProjectSkill> skills = projectSkillRepository.findSkillsByProjectIds(List.of(projectId));
        return new ProjectDiscoverableDetailResponse(project, skills);
    }
}
