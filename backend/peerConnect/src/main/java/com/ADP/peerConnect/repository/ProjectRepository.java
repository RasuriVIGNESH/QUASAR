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

    // ── Single project ────────────────────────────────────────────────────────

    @Query("""
        SELECT p FROM Project p
        JOIN FETCH p.team t
        JOIN FETCH t.lead
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.event
        WHERE p.id = :id
        """)
    Optional<Project> findByIdWithAssociations(@Param("id") String id);

    @Query(
            value = """
                SELECT p.id
                FROM Project p
                ORDER BY p.createdAt DESC
                """,
            countQuery = """
                SELECT COUNT(p)
                FROM Project p
                """
    )
    Page<String> findRecentProjectIds(Pageable pageable);


    @Query("""
        SELECT DISTINCT p
        FROM Project p
        JOIN FETCH p.team t
        JOIN FETCH t.lead tl
        LEFT JOIN FETCH tl.college
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.event
        LEFT JOIN FETCH p.projectSkills ps
        LEFT JOIN FETCH ps.skill
        WHERE p.id IN :ids
        """)
    List<Project> findByIdsWithCardAssociations(
            @Param("ids") List<String> ids
    );



    @Query(
            value = """
            SELECT DISTINCT p FROM Project p
            JOIN FETCH p.team t
            JOIN FETCH t.lead
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            WHERE t.lead.id = :userId
               OR EXISTS (
                   SELECT 1 FROM Team tm JOIN tm.members u
                   WHERE tm.project.id = p.id AND u.id = :userId
               )
            ORDER BY p.updatedAt DESC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p) FROM Project p
            JOIN p.team t
            WHERE t.lead.id = :userId
               OR EXISTS (
                   SELECT 1 FROM Team tm JOIN tm.members u
                   WHERE tm.project.id = p.id AND u.id = :userId
               )
            """
    )
    Page<Project> findProjectsByLeadOrMember(
            @Param("userId") String userId,
            Pageable pageable);

    @Query(
            value = """
            SELECT DISTINCT p FROM Project p
            JOIN FETCH p.team t
            JOIN FETCH t.lead
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            WHERE p.status = :status
              AND p.currentTeamSize < p.maxTeamSize
              AND t.lead.id != :userId
              AND NOT EXISTS (
                  SELECT 1 FROM Team tm JOIN tm.members u
                  WHERE tm.project.id = p.id AND u.id = :userId
              )
            ORDER BY p.createdAt DESC, p.id ASC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p) FROM Project p
            JOIN p.team t
            WHERE p.status = :status
              AND p.currentTeamSize < p.maxTeamSize
              AND t.lead.id != :userId
              AND NOT EXISTS (
                  SELECT 1 FROM Team tm JOIN tm.members u
                  WHERE tm.project.id = p.id AND u.id = :userId
              )
            """
    )
    Page<Project> findDiscoverProjectsForUser(
            @Param("userId") String userId,
            @Param("status") ProjectStatus status,
            Pageable pageable);

    @Query(
            value = """
            SELECT DISTINCT p FROM Project p
            JOIN FETCH p.team t
            JOIN FETCH t.lead u
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            WHERE u.college.id = :collegeId
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p) FROM Project p
            JOIN p.team t JOIN t.lead u
            WHERE u.college.id = :collegeId
            """
    )
    Page<Project> findByLeadCollegeId(
            @Param("collegeId") Long collegeId,
            Pageable pageable);

    @Query("""
        SELECT p FROM Project p
        WHERE p.status = 'RECRUITING'
          AND p.currentTeamSize < p.maxTeamSize
        """)
    Page<Project> findProjectsWithAvailableSpots(Pageable pageable);

    // ── Skills (hydration) ────────────────────────────────────────────────────

    @Query("""
        SELECT ps FROM ProjectSkill ps
        JOIN FETCH ps.skill
        WHERE ps.project.id IN :projectIds
        """)
    List<ProjectSkill> findSkillsByProjectIds(
            @Param("projectIds") List<String> projectIds);

    // ── Counts ────────────────────────────────────────────────────────────────

    @Query("""
        SELECT COUNT(DISTINCT p) FROM Project p
        JOIN p.team t
        WHERE t.lead.id = :userId
           OR EXISTS (
               SELECT 1 FROM Team tm JOIN tm.members u
               WHERE tm.project.id = p.id AND u.id = :userId
           )
        """)
    long countProjectsByLeadOrMember(@Param("userId") String userId);

    // ── Specification (search) ────────────────────────────────────────────────

    Page<Project> findAll(Specification<Project> spec, Pageable pageable);
    List<Project> findByEventId(Long eventId);
}
