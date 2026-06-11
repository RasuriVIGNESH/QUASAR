package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.ProjectRecommendationDTO;
import com.ADP.peerConnect.model.entity.UserRecommendedProject;
import java.util.List;

public interface RecommendationServiceWithPriority {

    /**
     * Get all recommended projects for a user
     * @param userId - User ID
     * @return List of recommended projects
     */
    List<UserRecommendedProject> getRecommendedProjects(String userId);

    /**
     * Get recommended projects for a user ordered by priority (highest first)
     * @param userId - User ID
     * @return List of recommended projects ordered by priority
     */
    List<UserRecommendedProject> getRecommendedProjectsByPriority(String userId);

    /**
     * Get top N recommended projects for a user by priority
     * @param userId - User ID
     * @param limit - Number of recommendations to return
     * @return List of top N recommended projects
     */
    List<UserRecommendedProject> getTopRecommendations(String userId, int limit);

    /**
     * Add a project recommendation for a user with priority
     * @param userId - User ID
     * @param projectId - Project ID to recommend (String)
     * @param priority - Priority value (1-100)
     * @return Updated list of recommended projects
     */
    List<UserRecommendedProject> addRecommendation(String userId, String projectId, Integer priority);

    /**
     * Add multiple project recommendations for a user with priorities
     * @param userId - User ID
     * @param recommendations - List of project IDs with priorities
     * @return Updated list of recommended projects
     */
    List<UserRecommendedProject> addMultipleRecommendations(String userId, List<ProjectRecommendationDTO> recommendations);

    /**
     * Update priority of an existing recommendation
     * @param userId - User ID
     * @param projectId - Project ID (String)
     * @param newPriority - New priority value
     * @return Updated recommendation
     */
    UserRecommendedProject updateRecommendationPriority(String userId, String projectId, Integer newPriority);

    /**
     * Remove a project recommendation for a user
     * @param userId - User ID
     * @param projectId - Project ID to remove (String)
     */
    void removeRecommendation(String userId, String projectId);

    /**
     * Clear all recommendations for a user
     * @param userId - User ID
     */
    void clearAllRecommendations(String userId);

    /**
     * Replace all recommendations for a user with new ones
     * Used by ML API to update recommendations
     * @param userId - User ID
     * @param recommendations - New list of project recommendations with priorities
     * @return New list of recommended projects
     */
    List<UserRecommendedProject> replaceAllRecommendations(String userId, List<ProjectRecommendationDTO> recommendations);
}