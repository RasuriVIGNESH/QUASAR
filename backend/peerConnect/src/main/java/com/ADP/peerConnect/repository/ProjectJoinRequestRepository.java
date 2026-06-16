package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectJoinRequest;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectJoinRequestRepository extends JpaRepository<ProjectJoinRequest, Long> {

    /**
     * Used by project lead to see who requested to join their project.
     * Does NOT need projectSkills — ProjectCardResponse not used here.
     */
    @Query("""
    SELECT DISTINCT r FROM ProjectJoinRequest r
    JOIN FETCH r.project p
    JOIN FETCH p.lead
    LEFT JOIN FETCH p.projectSkills ps
    LEFT JOIN FETCH ps.skill
    JOIN FETCH r.user
    WHERE r.project.id = :projectId
    ORDER BY r.createdAt DESC
    """)
    List<ProjectJoinRequest> findByProjectIdWithAssociations(
            @Param("projectId") String projectId);
    /**
     * Used by admin/lead to list all requests for a project with full project details.
     * Includes projectSkills chain for ProjectCardResponse.
     */
    @Query("""
        SELECT DISTINCT r FROM ProjectJoinRequest r
        JOIN FETCH r.project p
        JOIN FETCH p.lead
        JOIN FETCH p.category
        LEFT JOIN FETCH p.projectSkills ps
        LEFT JOIN FETCH ps.skill
        JOIN FETCH r.user
        WHERE r.user.id = :userId
        ORDER BY r.createdAt DESC
        """)
    List<ProjectJoinRequest> findByUserIdWithAssociations(@Param("userId") String userId);

    @Query("""
        SELECT r FROM ProjectJoinRequest r
        JOIN FETCH r.project p
        JOIN FETCH p.lead
        JOIN FETCH r.user
        WHERE r.id = :id
        """)
    Optional<ProjectJoinRequest> findByIdWithAssociations(@Param("id") Long id);

    boolean existsByProjectIdAndUserIdAndStatus(
            String projectId, String userId, InvitationStatus status);

    /**
     * FIX: Added LEFT JOIN FETCH p.projectSkills + ps.skill.
     * ProjectCardResponse accesses p.getProjectSkills().stream().map(ps -> ps.getSkill().getName())
     * Without this fetch, GraalVM Native Image throws HibernateProxy generation error at runtime.
     */
    @Query("""
        SELECT DISTINCT r FROM ProjectJoinRequest r
        JOIN FETCH r.project p
        JOIN FETCH p.lead
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.projectSkills ps
        LEFT JOIN FETCH ps.skill
        JOIN FETCH r.user
        WHERE r.user.id = :userId
        ORDER BY r.createdAt DESC
        """)
    List<ProjectJoinRequest> findMyRequests(@Param("userId") String userId);
}