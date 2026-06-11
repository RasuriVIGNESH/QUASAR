package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.Project.CreateProjectRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateProjectRequest;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectMember;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface iProjectService {

    Project createProject(CreateProjectRequest request, String leadId);

    Project updateProject(String projectId, UpdateProjectRequest request, String currentUserId);

    void deleteProject(String projectId, String currentUserId);

    Project findById(String projectId);

    Page<ProjectResponse> getRecentProjects(Pageable pageable);

    Page<Project> findByLead(String leadId, Pageable pageable);

    Page<Project> findProjectsByMember(String userId, Pageable pageable);

    Page<Project> findProjectsWithAvailableSpots(Pageable pageable);

    /**
     * FIX: Returns Page<ProjectCardResponse> (DTO) instead of Page<Project>
     * so the mapping occurs inside the @Transactional service method,
     * preventing LazyInitializationException on projectSkills.
     */
    Page<ProjectCardResponse> searchProjects(
            String query,
            String category,
            ProjectStatus status,
            List<String> skills,
            boolean availableOnly,
            Pageable pageable,
            String currentUserId);

    /**
     * FIX: Returns Page<ProjectCardResponse> instead of Page<Project>.
     */
    Page<ProjectCardResponse> findProjetsInCollege(String collegeId, Pageable pageable);

    boolean isUserMemberOrLead(String projectId, String userId);

    boolean isProjectLead(String projectId, String userId);

    boolean isProjectMember(String projectId, String userId);

    ProjectMember addMember(String projectId, String userId, ProjectRole role, String currentUserId);

    void removeMember(String projectId, Long memberId, String currentUserId);

    ProjectMember updateMemberRole(String projectId, Long memberId, ProjectRole newRole, String currentUserId);

    void leaveProject(String projectId, String currentUserId);

    List<ProjectMember> getProjectMembers(String projectId);

    /**
     * FIX: Returns Page<ProjectCardResponse> instead of Page<Project>.
     */
    Page<ProjectCardResponse> discoverProjects(String currentUserId, Pageable pageable);

    /**
     * FIX: Returns Page<ProjectResponse> (DTO) instead of Page<Project>
     * so mapping of lead/category occurs inside the transaction.
     */
    Page<ProjectResponse> findProjectsByUser(String userId, Pageable pageable);

    long countProjectsForUser(String userId);

    Long getCurrentTeamSize(String projectId);

    int countAllProjects();
}