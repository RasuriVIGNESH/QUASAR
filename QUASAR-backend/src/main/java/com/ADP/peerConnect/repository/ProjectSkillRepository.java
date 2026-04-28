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

    @Query("SELECT ps FROM ProjectSkill ps " +
            "JOIN FETCH ps.skill " +
            "WHERE ps.project.id = :projectId " +
            "ORDER BY ps.isRequired DESC, ps.skill.name ASC")
    List<ProjectSkill> findByProjectIdWithSkill(
            @Param("projectId") String projectId
    );

}
