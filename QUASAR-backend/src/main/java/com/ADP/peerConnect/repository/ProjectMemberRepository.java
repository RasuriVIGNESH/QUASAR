package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectMember;
import com.ADP.peerConnect.model.enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ProjectMember entity
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    /**
     * Find project members by project ID
     */
    List<ProjectMember> findByProject_IdOrderByCreatedAtAsc(String projectId);



    /**
     * Find project member by project ID and user ID
     */
    Optional<ProjectMember> findByProjectIdAndUserId(String projectId, String userId);
    
    /**
     * Check if user is a member of the project
     */
    boolean existsByProjectIdAndUserId(String projectId, String userId);
    
    /**
     * Find projects where user is a member
     */
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.user.id = :userId ORDER BY pm.createdAt DESC")
    List<ProjectMember> findByUserId(@Param("userId") String userId);
    
    /**
     * Find project members by role
     */
    List<ProjectMember> findByProjectIdAndRole(String projectId, ProjectRole role);
    
    /**
     * Count members in a project
     */
    long countByProjectId(String projectId);
    
    /**
     * Count projects where user is a member
     */
    long countByUserId(String userId);
    
    /**
     * Delete project member by project ID and user ID
     */
    void deleteByProjectIdAndUserId(String projectId, String userId);
    
    /**
     * Find project Lead (member with Lead role)
     */
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.role = com.ADP.peerConnect.model.enums.ProjectRole.LEAD")
    Optional<ProjectMember> findProjectLead(@Param("projectId") String projectId);
}
