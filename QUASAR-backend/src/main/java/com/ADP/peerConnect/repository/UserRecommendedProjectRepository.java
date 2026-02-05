package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import com.ADP.peerConnect.model.entity.UserRecommendedProjectId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRecommendedProjectRepository extends JpaRepository<UserRecommendedProject, UserRecommendedProjectId> {

    /**
     * Find all recommendations for a user
     */
    List<UserRecommendedProject> findByUserId(String userId);

    /**
     * Find all recommendations for a user ordered by priority (descending)
     */
    @Query("SELECT urp FROM UserRecommendedProject urp WHERE urp.user.id = :userId ORDER BY urp.priority DESC")
    List<UserRecommendedProject> findByUserIdOrderByPriorityDesc(@Param("userId") String userId);

    /**
     * Find all recommendations for a user ordered by priority (ascending)
     */
    @Query("SELECT urp FROM UserRecommendedProject urp WHERE urp.user.id = :userId ORDER BY urp.priority ASC")
    List<UserRecommendedProject> findByUserIdOrderByPriorityAsc(@Param("userId") String userId);

    /**
     * Find top N recommendations for a user by priority
     */
    @Query("SELECT urp FROM UserRecommendedProject urp WHERE urp.user.id = :userId ORDER BY urp.priority DESC")
    List<UserRecommendedProject> findTopByUserId(@Param("userId") String userId);

    /**
     * Delete all recommendations for a user
     */
    void deleteByUserId(String userId);

    /**
     * Delete specific recommendation (Changed to String)
     */
    void deleteByUserIdAndProjectId(String userId, String projectId);

    /**
     * Check if recommendation exists (Changed to String)
     */
    boolean existsByUserIdAndProjectId(String userId, String projectId);
}