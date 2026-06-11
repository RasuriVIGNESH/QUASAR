package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String>, JpaSpecificationExecutor<Project> {

    @Query("SELECT p FROM Project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.event " +
            "WHERE p.id = :id")
    Optional<Project> findByIdWithAssociations(@Param("id") String id);

    // Find projects by Event ID
    List<Project> findByEventId(Long eventId);

    // Find projects owned by a user
    Page<Project> findByLeadIdOrderByCreatedAtDesc(String LeadId, Pageable pageable);

    @Query(
            value = "SELECT p FROM Project p " +
                    "JOIN FETCH p.lead " +
                    "LEFT JOIN FETCH p.category " +
                    "LEFT JOIN FETCH p.event",
            countQuery = "SELECT count(p) FROM Project p"
    )
    Page<Project> findAllWithCategory(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT p) FROM Project p WHERE p.lead.id = :userId OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)")
    long countProjectsByLeadOrMember(@Param("userId") String userId);

    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId")
    Page<Project> findByMemberId(@Param("userId") String userId, Pageable pageable);

    @Query("""
        SELECT p FROM Project p
        WHERE p.status = 'RECRUITING'
        AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize
        """)
    Page<Project> findProjectsWithAvailableSpots(Pageable pageable);

    // Generic search supporting multiple filters via Specification
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);

    /**
     * Finds all projects a user is associated with (as Lead OR member).
     * FIX: Added LEFT JOIN FETCH p.projectSkills and LEFT JOIN FETCH ps.skill
     *      so ProjectCardResponse can access skillsRequired without LazyInitializationException.
     */
    @Query(
            value = "SELECT DISTINCT p FROM Project p " +
                    "JOIN FETCH p.lead " +
                    "LEFT JOIN FETCH p.category " +
                    "LEFT JOIN FETCH p.event " +
//                    "LEFT JOIN FETCH p.projectSkills ps " +
//                    "LEFT JOIN FETCH ps.skill " +
                    "WHERE p.lead.id = :userId " +
                    "OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId) " +
                    "ORDER BY p.updatedAt DESC",
            countQuery = "SELECT count(DISTINCT p) FROM Project p " +
                    "WHERE p.lead.id = :userId " +
                    "OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)"
    )
    Page<Project> findProjectsByLeadOrMember(@Param("userId") String userId, Pageable pageable);

    /**
     * Finds projects for the "Discover" feature.
     * FIX: Added LEFT JOIN FETCH p.projectSkills and LEFT JOIN FETCH ps.skill.
     */
    @Query(
            value = """
        SELECT DISTINCT p FROM Project p
        JOIN FETCH p.lead
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.event
        WHERE p.status = :status
        AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize
        AND p.lead.id != :userId
        AND NOT EXISTS (
            SELECT 1 FROM ProjectMember pm
            WHERE pm.project.id = p.id
            AND pm.user.id = :userId
        )
        ORDER BY p.createdAt DESC
        """,
            countQuery = """
        SELECT COUNT(DISTINCT p) FROM Project p
        WHERE p.status = :status
        AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize
        AND p.lead.id != :userId
        AND NOT EXISTS (
            SELECT 1 FROM ProjectMember pm
            WHERE pm.project.id = p.id
            AND pm.user.id = :userId
        )
        """
    )
    Page<Project> findDiscoverProjectsForUser(
            @Param("userId") String userId,
            @Param("status") ProjectStatus status,
            Pageable pageable
    );

    /**
     * Full-text search query.
     * FIX: Added LEFT JOIN FETCH p.projectSkills / ps.skill so the returned
     *      Project objects can be safely mapped to ProjectCardResponse.
     */
    @Query(
            value = """
        SELECT DISTINCT p
        FROM Project p
        JOIN FETCH p.lead
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.event
        WHERE
            (:query IS NULL OR
             LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY p.createdAt DESC
        """,
            countQuery = """
        SELECT COUNT(DISTINCT p)
        FROM Project p
        WHERE
            (:query IS NULL OR
             LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))
        """
    )
    Page<Project> searchProjects(
            @Param("query") String query,
            Pageable pageable
    );
    @Query("""
    SELECT ps
    FROM ProjectSkill ps
    JOIN FETCH ps.skill
    WHERE ps.project.id IN :projectIds
""")
    List<ProjectSkill> findSkillsByProjectIds(
            @Param("projectIds") List<String> projectIds
    );
    /**
     * Find projects by college.
     * FIX: Added JOIN FETCH so lead/category/projectSkills are loaded eagerly,
     *      preventing LazyInitializationException in ProjectCardResponse.
     */
    @Query(
            value = "SELECT DISTINCT p FROM Project p " +
                    "JOIN FETCH p.lead u " +
                    "LEFT JOIN FETCH p.category " +
                    "LEFT JOIN FETCH p.event " +
                    "WHERE u.college.id = :collegeId",
            countQuery = "SELECT COUNT(DISTINCT p) FROM Project p " +
                    "JOIN p.lead u WHERE u.college.id = :collegeId"
    )
    Page<Project> findByLeadCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
}