package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.Project;
import java.util.Set;

public interface iRecommendationService {

    /**
     * Get all recommended projects for a user
     * @param userId - User ID
     * @return Set of recommended projects
     */
    Set<Project> getRecommendedProjects(String userId);

    /**
     * Add a project recommendation for a user
     * @param userId - User ID
     * @param projectId - Project ID to recommend
     * @return Updated set of recommended projects
     */
    Set<Project> addRecommendation(String userId, String projectId);

    /**
     * Add multiple project recommendations for a user
     * @param userId - User ID
     * @param projectIds - List of project IDs to recommend
     * @return Updated set of recommended projects
     */
    Set<Project> addMultipleRecommendations(String userId, Set<String> projectIds);

    /**
     * Remove a project recommendation for a user
     * @param userId - User ID
     * @param projectId - Project ID to remove
     * @return Updated set of recommended projects
     */
    Set<Project> removeRecommendation(String userId, String projectId);

    /**
     * Clear all recommendations for a user
     * @param userId - User ID
     */
    void clearAllRecommendations(String userId);

    /**
     * Replace all recommendations for a user with new ones
     * Used by ML API to update recommendations
     * @param userId - User ID
     * @param projectIds - New set of project IDs
     * @return New set of recommended projects
     */
    Set<Project> replaceAllRecommendations(String userId, Set<String> projectIds);
}