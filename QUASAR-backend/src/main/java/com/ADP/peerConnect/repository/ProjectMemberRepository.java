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

    @Query("SELECT pm FROM ProjectMember pm " +
            "JOIN FETCH pm.user " +
            "WHERE pm.project.id = :projectId " +
            "ORDER BY pm.createdAt ASC")
    List<ProjectMember> findByProjectIdWithUser(@Param("projectId") String projectId);

    @Query("SELECT pm FROM ProjectMember pm " +
            "JOIN FETCH pm.user " +
            "WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    Optional<ProjectMember> findByProjectIdAndUserIdWithUser(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    List<ProjectMember> findByProject_IdOrderByCreatedAtAsc(String projectId);

    Optional<ProjectMember> findByProjectIdAndUserId(String projectId, String userId);

    boolean existsByProjectIdAndUserId(String projectId, String userId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.user.id = :userId ORDER BY pm.createdAt DESC")
    List<ProjectMember> findByUserId(@Param("userId") String userId);

    long countByProjectId(String projectId);
}
