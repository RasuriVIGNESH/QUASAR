package com.ADP.peerConnect.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ADP.peerConnect.model.entity.ProjectRecommendedCandidate;

@Repository
public interface ProjectRecommendedCandidateRepository extends JpaRepository<ProjectRecommendedCandidate, UUID> {

    List<ProjectRecommendedCandidate> findByProjectId(String projectId);

    List<ProjectRecommendedCandidate> findByUserId(String userId);

    boolean existsByProjectIdAndUserId(String projectId, String userId);

}
