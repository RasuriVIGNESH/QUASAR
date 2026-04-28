package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {

    @Query("SELECT pi FROM ProjectInvitation pi " +
            "JOIN FETCH pi.project p " +
            "JOIN FETCH p.lead " +
            "JOIN FETCH pi.invitedUser " +
            "JOIN FETCH pi.invitedBy " +
            "WHERE pi.id = :id")
    Optional<ProjectInvitation> findByIdWithAssociations(@Param("id") Long id);
    @Query(
            value = "SELECT pi FROM ProjectInvitation pi " +
                    "JOIN FETCH pi.project p " +
                    "JOIN FETCH p.lead " +
                    "LEFT JOIN FETCH p.category " +   // 🔥 FIX
                    "JOIN FETCH pi.invitedUser " +
                    "JOIN FETCH pi.invitedBy " +
                    "WHERE pi.invitedUser.id = :uid " +
                    "ORDER BY pi.createdAt DESC",
            countQuery = "SELECT COUNT(pi) FROM ProjectInvitation pi WHERE pi.invitedUser.id = :uid"
    )
    Page<ProjectInvitation> findByInvitedUserIdWithAssociations(
            @Param("uid") String uid,
            Pageable pageable
    );

    @Query(
            value = "SELECT pi FROM ProjectInvitation pi " +
                    "JOIN FETCH pi.project p " +
                    "JOIN FETCH p.lead " +
                    "JOIN FETCH pi.invitedUser " +
                    "JOIN FETCH pi.invitedBy " +
                    "WHERE pi.invitedUser.id = :uid AND pi.status = :status " +
                    "ORDER BY pi.createdAt DESC",
            countQuery = "SELECT COUNT(pi) FROM ProjectInvitation pi WHERE pi.invitedUser.id = :uid AND pi.status = :status"
    )
    Page<ProjectInvitation> findByInvitedUserIdAndStatusWithAssociations(
            @Param("uid") String uid,
            @Param("status") InvitationStatus status,
            Pageable pageable
    );
    @Query(
            value = "SELECT pi FROM ProjectInvitation pi " +
                    "JOIN FETCH pi.project p " +
                    "JOIN FETCH p.lead " +
                    "JOIN FETCH p.category " +
                    "JOIN FETCH pi.invitedUser " +
                    "JOIN FETCH pi.invitedBy " +
                    "WHERE pi.project.id = :projectId " +
                    "ORDER BY pi.createdAt DESC",
            countQuery = "SELECT COUNT(pi) FROM ProjectInvitation pi WHERE pi.project.id = :projectId"
    )
    Page<ProjectInvitation> findByProjectIdWithAssociations(
            @Param("projectId") String projectId,
            Pageable pageable
    );

    /**
     * Finds a page of invitations for a specific user, with an optional status filter.
     * Used when the 'status' parameter is provided.
     * @param invitedUserId The ID of the user who was invited.
     * @param status The status to filter by (e.g., PENDING).
     * @param pageable The pagination information.
     * @return A page of project invitations.
     */
    Page<ProjectInvitation> findByInvitedUserIdAndStatusOrderByCreatedAtDesc(String invitedUserId, InvitationStatus status, Pageable pageable);

    boolean existsByProjectIdAndInvitedUserIdAndStatus(String projectId, String invitedUserId, InvitationStatus status);

    Page<ProjectInvitation> findByProjectIdOrderByCreatedAtDesc(String projectId, Pageable pageable);

    Page<ProjectInvitation> findByInvitedUserIdAndStatus(String invitedUserId, InvitationStatus status, Pageable pageable);



}