package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ProjectSkill entity
 */
@Repository
public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {
    
    /**
     * Find project skills by project ID
     */
    List<ProjectSkill> findByProjectIdOrderByIsRequiredDescSkillNameAsc(String projectId);
    
    /**
     * Find project skill by project ID and skill ID
     */
    Optional<ProjectSkill> findByProjectIdAndSkillId(String projectId, Long skillId);

    /**
     * Check if project has a specific skill requirement
     */
    @Query("SELECT COUNT(ps) > 0 FROM ProjectSkill ps JOIN ps.skill s WHERE ps.project.id = :projectId AND LOWER(s.name) = LOWER(:skillName)")
    boolean existsByProjectIdAndSkillNameIgnoreCase(@Param("projectId") String projectId, @Param("skillName") String skillName);
    
    /**
     * Delete project skills by project ID
     */
    void deleteByProjectId(String projectId);
    
    /**
     * Find required skills for a project
     */
    List<ProjectSkill> findByProjectIdAndIsRequiredTrue(String projectId);
    
    /**
     * Find optional skills for a project
     */
    List<ProjectSkill> findByProjectIdAndIsRequiredFalse(String projectId);
    
    /**
     * Count skills for a project
     */
    long countByProjectId(String projectId);
}
