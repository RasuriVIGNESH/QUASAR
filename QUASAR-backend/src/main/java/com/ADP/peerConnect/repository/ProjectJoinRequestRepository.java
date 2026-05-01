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

    @Query("SELECT r FROM ProjectJoinRequest r " +
            "JOIN FETCH r.project p " +
            "JOIN FETCH p.lead " +
            "JOIN FETCH r.user " +
            "WHERE r.project.id = :projectId " +
            "ORDER BY r.createdAt DESC")
    default List<ProjectJoinRequest> findByProjectIdWithAssociations(@Param("projectId") String projectId) {
        return null;
    }
    @Query("SELECT DISTINCT r FROM ProjectJoinRequest r " +
            "JOIN FETCH r.project p " +
            "JOIN FETCH p.lead " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.projectSkills ps " +
            "LEFT JOIN FETCH ps.skill " +
            "JOIN FETCH r.user " +
            "WHERE r.user.id = :userId " +
            "ORDER BY r.createdAt DESC")
    List<ProjectJoinRequest> findByUserIdWithAssociations(@Param("userId") String userId);
    @Query("SELECT r FROM ProjectJoinRequest r " +
            "JOIN FETCH r.project p " +
            "JOIN FETCH p.lead " +
            "JOIN FETCH r.user " +
            "WHERE r.id = :id")
    Optional<ProjectJoinRequest> findByIdWithAssociations(@Param("id") Long id);


    // Check if a pending request already exists for a user and project
    boolean existsByProjectIdAndUserIdAndStatus(String projectId, String userId, InvitationStatus status);

}