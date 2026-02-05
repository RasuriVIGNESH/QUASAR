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

@Repository
public interface ProjectRepository extends JpaRepository<Project, String>, JpaSpecificationExecutor<Project> {

    static int countProjectsInCollege(String collegeId) {
        throw new UnsupportedOperationException("Unimplemented method 'countProjectsInCollege'");
    }

    // Find projects owned by a user
    Page<Project> findByLeadIdOrderByCreatedAtDesc(String LeadId, Pageable pageable);

    // Count projects owned by a user
    long countByLeadId(String LeadId);

    // Count projects where user is Lead OR member
    @Query("SELECT COUNT(DISTINCT p) FROM Project p WHERE p.lead.id = :userId OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)")
    long countProjectsByLeadOrMember(@Param("userId") String userId);

    // Find projects where user is a member
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId")
    Page<Project> findByMemberId(@Param("userId") String userId, Pageable pageable);

    // Find projects by status
    Page<Project> findByStatusOrderByCreatedAtDesc(ProjectStatus status, Pageable pageable);

    // Find projects by category name
    Page<Project> findByCategoryNameIgnoreCaseOrderByCreatedAtDesc(String categoryName, Pageable pageable);

    // Search by title or description
    @Query("SELECT p FROM Project p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Project> searchByKeyword(@Param("query") String query, Pageable pageable);

    // Find projects with available spots
    @Query("SELECT p FROM Project p WHERE p.status = 'RECRUITING' AND SIZE(p.projectMembers) < p.maxTeamSize")
    Page<Project> findProjectsWithAvailableSpots(Pageable pageable);

    // Generic search supporting multiple filters via Specification
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);

    /**
     * Finds all projects a user is associated with (as Lead OR member).
     * Used for the "My Projects" feature.
     */
    @Query("SELECT p FROM Project p WHERE p.lead.id = :userId OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId) ORDER BY p.updatedAt DESC")
    Page<Project> findProjectsByLeadOrMember(@Param("userId") String userId, Pageable pageable);

    /**
     * Finds projects for the "Discover" feature.
     */
    @Query(value = "SELECT p FROM Project p JOIN FETCH p.lead WHERE p.status = :status AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize AND p.lead.id != :userId AND NOT EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId) ORDER BY p.createdAt DESC",
            countQuery = "SELECT count(p) FROM Project p WHERE p.status = :status AND (SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = p.id) < p.maxTeamSize AND p.lead.id != :userId AND NOT EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.id = p.id AND pm.user.id = :userId)")
    Page<Project> findDiscoverProjectsForUser(@Param("userId") String userId, @Param("status") ProjectStatus status, Pageable pageable);

    // Find projects by projectFor name (case-insensitive)
    @Query("SELECT p FROM Project p WHERE p.category IS NOT NULL AND LOWER(p.category.name) = LOWER(:categoryName)")
    Page<Project> findByCategoryNameIgnoreCase(@Param("categoryName") String categoryName, Pageable pageable);

    // Find projects by category id
    Page<Project> findByCategoryId(String categoryId, Pageable pageable);

    // Find projects by lead's college id (uses nested property)
    Page<Project> findByLeadCollegeId(Long cId, Pageable pageable);
}
