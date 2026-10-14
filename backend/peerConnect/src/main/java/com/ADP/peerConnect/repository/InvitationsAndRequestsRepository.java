package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse;
import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.model.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationsAndRequestsRepository
        extends JpaRepository<InvitationsAndRequests, Long> {

    /*
     * Used when opening or processing a single invitation/request.
     */
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
            WHERE r.id = :id
            """)
    Optional<InvitationsAndRequests> findByIdWithAssociations(
            @Param("id") Long id
    );

    /*
     * Project-level paginated query.
     *
     * Do not fetch-join p.projectSkills here because this method returns Page.
     * Fetch-joining a collection with pagination can produce incorrect pagination
     * or in-memory pagination in Hibernate.
     */
    @Query(
            value = """
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
                    WHERE r.project.id = :projectId
                      AND r.requestType = :requestType
                    ORDER BY r.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(r)
                    FROM InvitationsAndRequests r
                    WHERE r.project.id = :projectId
                      AND r.requestType = :requestType
                    """
    )
    Page<InvitationsAndRequests> findByProjectIdAndTypeWithAssociations(
            @Param("projectId") String projectId,
            @Param("requestType") RequestType requestType,
            Pageable pageable
    );

    /*
     * Returns all invitations/requests for a target user by type.
     */
    @Query(
            value = """
                    SELECT r
                    FROM InvitationsAndRequests r
                    JOIN FETCH r.project p
                    LEFT JOIN FETCH p.category
                    LEFT JOIN FETCH p.event
                    JOIN FETCH r.targetUser tu
                    LEFT JOIN FETCH tu.college
                    LEFT JOIN FETCH r.initiatedBy ib
                    LEFT JOIN FETCH ib.college
                    WHERE r.targetUser.id = :uid
                      AND r.requestType = :requestType
                    ORDER BY r.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(r)
                    FROM InvitationsAndRequests r
                    WHERE r.targetUser.id = :uid
                      AND r.requestType = :requestType
                    """
    )
    Page<InvitationsAndRequests> findByTargetUserIdAndTypeWithAssociations(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            Pageable pageable
    );

    /*
     * Corrected method:
     * r.status = :status was missing from your original query.
     */
    @Query(
            value = """
                SELECT new com.ADP.peerConnect.model.dto.response.Project.InvitationsAndRequestsResponse(
                    r.id,
                    r.requestType,
                    p.id,
                    p.title,
                    ib.id,
                    ib.firstName,
                    tu.id,
                    tu.firstName,
                    r.status,
                    r.message,
                    r.createdAt,
                    r.respondedAt
                )
                FROM InvitationsAndRequests r
                JOIN r.project p
                JOIN r.targetUser tu
                LEFT JOIN r.initiatedBy ib
                WHERE tu.id = :uid
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
                """
    )
    Page<InvitationsAndRequestsResponse>
    findByTargetUserIdAndTypeAndStatusResponse(
            @Param("uid") String uid,
            @Param("requestType") RequestType requestType,
            @Param("status") Status status,
            Pageable pageable
    );


    boolean existsByProjectIdAndTargetUserIdAndStatus(
            String projectId,
            String targetUserId,
            Status status
    );

    boolean existsByProjectIdAndTargetUserIdAndRequestTypeAndStatus(
            String projectId,
            String targetUserId,
            RequestType requestType,
            Status status
    );

    List<InvitationsAndRequests> findByProjectIdAndRequestType(
            String projectId,
            RequestType requestType
    );
}
