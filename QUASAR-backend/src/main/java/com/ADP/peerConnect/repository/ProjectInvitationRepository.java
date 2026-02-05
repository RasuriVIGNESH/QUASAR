package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {

    /**
     * Finds a page of invitations for a specific user, with an optional status filter.
     * Used when the 'status' parameter is provided.
     * @param invitedUserId The ID of the user who was invited.
     * @param status The status to filter by (e.g., PENDING).
     * @param pageable The pagination information.
     * @return A page of project invitations.
     */
    Page<ProjectInvitation> findByInvitedUserIdAndStatusOrderByCreatedAtDesc(String invitedUserId, InvitationStatus status, Pageable pageable);

    /**
     * Finds a page of all invitations for a specific user, regardless of status.
     * Used when the 'status' parameter is not provided.
     * @param invitedUserId The ID of the user who was invited.
     * @param pageable The pagination information.
     * @return A page of project invitations.
     */
    Page<ProjectInvitation> findByInvitedUserIdOrderByCreatedAtDesc(String invitedUserId, Pageable pageable);

    boolean existsByProjectIdAndInvitedUserIdAndStatus(String projectId, String invitedUserId, InvitationStatus status);

    List<ProjectInvitation> findByProjectIdOrderByCreatedAtDesc(String projectId);

    List<ProjectInvitation> findByInvitedUserIdAndStatus(String invitedUserId, InvitationStatus status);

    Page<ProjectInvitation> findByProjectIdOrderByCreatedAtDesc(String projectId, Pageable pageable);

    Page<ProjectInvitation> findByInvitedUserIdAndStatus(String invitedUserId, InvitationStatus status, Pageable pageable);



}