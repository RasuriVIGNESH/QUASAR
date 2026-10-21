package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.model.enums.Status;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface InvitationsAndRequestsRepository extends JpaRepository<InvitationsAndRequests, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM InvitationsAndRequests r WHERE r.id = :id")
    Optional<InvitationsAndRequests> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT r
            FROM InvitationsAndRequests r
            JOIN FETCH r.project p
            LEFT JOIN FETCH p.team t
            LEFT JOIN FETCH t.lead tl
            LEFT JOIN FETCH tl.college
            JOIN FETCH r.targetUser tu
            LEFT JOIN FETCH tu.college
            LEFT JOIN FETCH r.initiatedBy ib
            LEFT JOIN FETCH ib.college
            LEFT JOIN FETCH r.projectRole
            WHERE r.id = :id
            """)
    Optional<InvitationsAndRequests> findByIdWithAssociations(@Param("id") Long id);

    @Query(value = """
            SELECT r
            FROM InvitationsAndRequests r
            JOIN FETCH r.project p
            LEFT JOIN FETCH p.team t
            LEFT JOIN FETCH t.lead tl
            LEFT JOIN FETCH tl.college
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            JOIN FETCH r.targetUser tu
            LEFT JOIN FETCH tu.college
            LEFT JOIN FETCH r.initiatedBy ib
            LEFT JOIN FETCH ib.college
            LEFT JOIN FETCH r.projectRole
            WHERE r.project.id = :projectId
              AND r.requestType = :requestType
            ORDER BY r.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(r)
            FROM InvitationsAndRequests r
            WHERE r.project.id = :projectId
              AND r.requestType = :requestType
            """)
    Page<InvitationsAndRequests> findByProjectIdAndTypeWithAssociations(
            @Param("projectId") String projectId,
            @Param("requestType") RequestType requestType,
            Pageable pageable);

    @Query(value = """
            SELECT r
            FROM InvitationsAndRequests r
            JOIN FETCH r.project p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            JOIN FETCH r.targetUser tu
            LEFT JOIN FETCH tu.college
            LEFT JOIN FETCH r.initiatedBy ib
            LEFT JOIN FETCH ib.college
            LEFT JOIN FETCH r.projectRole
            WHERE r.targetUser.id = :uid
              AND r.requestType = :requestType
            ORDER BY r.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(r)
            FROM InvitationsAndRequests r
            WHERE r.targetUser.id = :uid
              AND r.requestType = :requestType
            """)
    Page<InvitationsAndRequests> findByTargetUserIdAndTypeWithAssociations(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            Pageable pageable);

    @Query(value = """
            SELECT r
            FROM InvitationsAndRequests r
            JOIN FETCH r.project p
            LEFT JOIN FETCH p.team t
            LEFT JOIN FETCH t.lead tl
            LEFT JOIN FETCH tl.college
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.event
            JOIN FETCH r.targetUser tu
            LEFT JOIN FETCH tu.college
            LEFT JOIN FETCH r.initiatedBy ib
            LEFT JOIN FETCH ib.college
            LEFT JOIN FETCH r.projectRole
            WHERE r.targetUser.id = :uid
              AND r.requestType = :requestType
              AND r.status = :status
            ORDER BY r.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(r)
            FROM InvitationsAndRequests r
            WHERE r.targetUser.id = :uid
              AND r.requestType = :requestType
              AND r.status = :status
            """)
    Page<InvitationsAndRequests> findByTargetUserIdAndTypeAndStatusWithAssociations(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            @Param("status") Status status,
            Pageable pageable);

    Optional<InvitationsAndRequests> findFirstByProjectIdAndTargetUserIdAndStatusOrderByCreatedAtDesc(
            String projectId, String targetUserId, Status status);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM InvitationsAndRequests r WHERE r.projectRole.id = :roleId AND r.status = :status")
    boolean existsByProjectRoleIdAndStatus(@Param("roleId") Long roleId, @Param("status") Status status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r FROM InvitationsAndRequests r
            JOIN FETCH r.targetUser
            JOIN FETCH r.project
            WHERE r.project.id = :projectId
              AND r.projectRole.id = :roleId
              AND r.status = :status
              AND (:excludedId IS NULL OR r.id <> :excludedId)
            """)
    List<InvitationsAndRequests> findPendingByProjectAndRoleExcept(
            @Param("projectId") String projectId,
            @Param("roleId") Long roleId,
            @Param("status") Status status,
            @Param("excludedId") Long excludedId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r FROM InvitationsAndRequests r
            JOIN FETCH r.targetUser
            JOIN FETCH r.project
            WHERE r.project.id = :projectId
              AND r.status = :status
              AND (:excludedId IS NULL OR r.id <> :excludedId)
            """)
    List<InvitationsAndRequests> findPendingByProjectExcept(
            @Param("projectId") String projectId,
            @Param("status") Status status,
            @Param("excludedId") Long excludedId);

    @Query("SELECT DISTINCT r.projectRole.id FROM InvitationsAndRequests r " +
            "WHERE r.projectRole.id IN :roleIds")
    List<Long> findReferencedProjectRoleIds(@Param("roleIds") Collection<Long> roleIds);

    @Query("SELECT DISTINCT r.project.id FROM InvitationsAndRequests r " +
            "WHERE r.targetUser.id = :userId AND r.status = :status")
    List<String> findProjectIdsByTargetUserIdAndStatus(
            @Param("userId") String userId, @Param("status") Status status);

    @Query("SELECT DISTINCT r.targetUser.id FROM InvitationsAndRequests r " +
            "WHERE r.project.id = :projectId AND r.status = :status")
    List<String> findTargetUserIdsByProjectIdAndStatus(
            @Param("projectId") String projectId, @Param("status") Status status);
}
