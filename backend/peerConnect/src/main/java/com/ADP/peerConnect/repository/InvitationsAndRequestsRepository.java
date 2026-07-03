package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.model.enums.RequestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationsAndRequestsRepository extends JpaRepository<InvitationsAndRequests, Long> {

    @Query("""
        SELECT r FROM InvitationsAndRequests r
        JOIN FETCH r.project p
        JOIN FETCH p.team t
        JOIN FETCH t.lead
        JOIN FETCH r.targetUser
        LEFT JOIN FETCH r.initiatedBy
        WHERE r.id = :id
        """)
    Optional<InvitationsAndRequests> findByIdWithAssociations(@Param("id") Long id);

    @Query(
            value = """
            SELECT DISTINCT r FROM InvitationsAndRequests r
            JOIN FETCH r.project p
            JOIN FETCH p.team t
            JOIN FETCH t.lead
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.projectSkills ps
            LEFT JOIN FETCH ps.skill
            JOIN FETCH r.targetUser
            LEFT JOIN FETCH r.initiatedBy
            WHERE r.project.id = :projectId AND r.requestType = :requestType
            ORDER BY r.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(r) FROM InvitationsAndRequests r
            WHERE r.project.id = :projectId AND r.requestType = :requestType
            """
    )
    Page<InvitationsAndRequests> findByProjectIdAndTypeWithAssociations(
            @Param("projectId") String projectId,
            @Param("requestType") RequestType requestType,
            Pageable pageable);

    @Query(
            value = """
        SELECT r FROM InvitationsAndRequests r
        JOIN FETCH r.project p
        JOIN FETCH r.targetUser
        LEFT JOIN FETCH r.initiatedBy
        WHERE r.targetUser.id = :uid AND r.requestType = :requestType
        ORDER BY r.createdAt DESC
        """,
            countQuery = """
        SELECT COUNT(r) FROM InvitationsAndRequests r
        WHERE r.targetUser.id = :uid AND r.requestType = :requestType
        """
    )
    Page<InvitationsAndRequests> findByTargetUserIdAndTypeWithAssociations(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            Pageable pageable);

    @Query(
            value = """
    SELECT r FROM InvitationsAndRequests r
    JOIN FETCH r.project p
    JOIN FETCH r.targetUser
    LEFT JOIN FETCH r.initiatedBy
    WHERE r.targetUser.id = :uid AND r.requestType = :requestType AND r.status = :status
    ORDER BY r.createdAt DESC
    """,
            countQuery = """
    SELECT COUNT(r) FROM InvitationsAndRequests r
    WHERE r.targetUser.id = :uid AND r.requestType = :requestType AND r.status = :status
    """
    )
    Page<InvitationsAndRequests> findByTargetUserIdAndTypeAndStatusWithAssociations(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            @Param("status") Status status,
            Pageable pageable);
    boolean existsByProjectIdAndTargetUserIdAndStatus(
            String projectId, String targetUserId, Status status);

    boolean existsByProjectIdAndTargetUserIdAndRequestTypeAndStatus(
            String projectId, String targetUserId, RequestType requestType, Status status);

    List<InvitationsAndRequests> findByProjectIdAndRequestType(String projectId, RequestType requestType);
}