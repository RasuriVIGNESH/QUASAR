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

    @Query("SELECT urp FROM UserRecommendedProject urp " +
            "JOIN FETCH urp.project p " +
            "WHERE urp.user.id = :userId")
    List<UserRecommendedProject> findByUserIdWithProject(@Param("userId") String userId);

    @Query("SELECT urp FROM UserRecommendedProject urp " +
            "JOIN FETCH urp.project p " +
            "WHERE urp.user.id = :userId " +
            "ORDER BY urp.priority DESC")
    List<UserRecommendedProject> findByUserIdWithProjectOrderByPriorityDesc(@Param("userId") String userId);

    void deleteByUserId(String userId);

    void deleteByUserIdAndProjectId(String userId, String projectId);

}