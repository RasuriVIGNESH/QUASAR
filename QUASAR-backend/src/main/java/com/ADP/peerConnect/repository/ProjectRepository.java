package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Project;
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
     * Used for the "My Projects" feature.
     */
    @Query(
            value = "SELECT p FROM Project p " +
                    "JOIN FETCH p.lead " +
                    "LEFT JOIN FETCH p.category " +
                    "LEFT JOIN FETCH p.event " +
                    "WHERE p.lead.id = :userId " +
                    "OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId) " +
                    "ORDER BY p.updatedAt DESC",
            countQuery = "SELECT count(p) FROM Project p " +
                    "WHERE p.lead.id = :userId " +
                    "OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)"
    )
    Page<Project> findProjectsByLeadOrMember(@Param("userId") String userId, Pageable pageable);

    /**
     * Finds projects for the "Discover" feature.
     */
    @Query(
            value = "SELECT p FROM Project p " +
                    "JOIN FETCH p.lead " +
                    "LEFT JOIN FETCH p.category " +
                    "LEFT JOIN FETCH p.event " +
                    "WHERE p.status = :status " +
                    "AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize " +
                    "AND p.lead.id != :userId " +
                    "AND NOT EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId) " +
                    "ORDER BY p.createdAt DESC",
            countQuery = "SELECT count(p) FROM Project p " +
                    "WHERE p.status = :status " +
                    "AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize " +
                    "AND p.lead.id != :userId " +
                    "AND NOT EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)"
    )
    Page<Project> findDiscoverProjectsForUser(
            @Param("userId") String userId,
            @Param("status") ProjectStatus status,
            Pageable pageable);

    Page<Project> findByLeadCollegeId(Long cId, Pageable pageable);
}
