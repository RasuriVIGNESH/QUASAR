package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectJoinRequest;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectJoinRequestRepository extends JpaRepository<ProjectJoinRequest, Long> {

    // Check if a pending request already exists for a user and project
    boolean existsByProjectIdAndUserIdAndStatus(String projectId, String userId, InvitationStatus status);

    // Find all requests sent by a specific user
    List<ProjectJoinRequest> findByUserIdOrderByCreatedAtDesc(String userId);

    // Find all requests for a specific project
    List<ProjectJoinRequest> findByProjectIdOrderByCreatedAtDesc(String projectId);
}