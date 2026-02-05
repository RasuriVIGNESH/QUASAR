package com.ADP.peerConnect.service.Interface;


import com.ADP.peerConnect.model.dto.request.Project.CreateProjectRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateProjectRequest;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectMember;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import net.bytebuddy.implementation.bytecode.assign.TypeCasting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface iProjectService {
    public Project createProject(CreateProjectRequest request, String LeadId) ;
    public Project updateProject(String projectId, UpdateProjectRequest request, String currentUserId);
    public void deleteProject(String projectId, String currentUserId) ;
    public Project findById(String projectId) ;
    public Page<Project> findAll(Pageable pageable) ;
    public Page<Project> findProjectsByMember(String userId, Pageable pageable);      // Get projects where user is a member
    public Page<Project> findProjectsWithAvailableSpots(Pageable pageable);        // Get projects with available spots
    public boolean isUserMemberOrLead(String projectId, String userId);
    public boolean isProjectLead(String projectId, String userId) ;
    public boolean isProjectMember(String projectId, String userId);
    public Page<Project> discoverProjects(String currentUserId, Pageable pageable) ;
    public Page<Project> findProjectsByUser(String userId, Pageable pageable) ;
    public long countProjectsForUser(String userId);
    public Long getCurrentTeamSize(String projectId);

    public int countProjectsInCollege(String collegeId);

    public int countAllProjects();


    // Search projects by various criteria
    public Page<Project> searchProjects(
            String query,
            String category,
            ProjectStatus status,
            List<String> skills,
            boolean availableOnly,
            Pageable pageable,
            String currentUserId
    ) ;


    public Page<Project> findProjetsInCollege(String collegeId, Pageable pageable) ;
    public ProjectMember addMember(String projectId, String userId, ProjectRole role, String currentUserId) ;
    public void removeMember(String projectId, Long memberId, String currentUserId) ;
    public Page<Project> findByLead(String LeadId, Pageable pageable);        // Get projects owned by a user
    public void leaveProject(String projectId, String currentUserId) ;    // for a member
    public ProjectMember updateMemberRole(String projectId, Long memberId, ProjectRole newRole, String currentUserId) ;
    public List<ProjectMember> getProjectMembers(String projectId);
}
