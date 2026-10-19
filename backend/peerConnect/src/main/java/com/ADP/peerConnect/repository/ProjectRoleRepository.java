package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectRole;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    @Query("SELECT r FROM ProjectRole r WHERE r.project.id = :projectId ORDER BY r.name ASC, r.id ASC")
    List<ProjectRole> findAllByProjectId(@Param("projectId") String projectId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM ProjectRole r WHERE r.project.id = :projectId")
    boolean existsAnyByProjectId(@Param("projectId") String projectId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM ProjectRole r WHERE r.project.id = :projectId AND r.filled = false")
    boolean existsOpenByProjectId(@Param("projectId") String projectId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ProjectRole r WHERE r.id = :roleId AND r.project.id = :projectId")
    Optional<ProjectRole> findByIdAndProjectIdForUpdate(@Param("roleId") Long roleId,
                                                        @Param("projectId") String projectId);
}
