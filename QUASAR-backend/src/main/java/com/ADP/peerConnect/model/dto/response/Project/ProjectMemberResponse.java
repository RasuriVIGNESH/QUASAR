package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Project member response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectMemberResponse {

    private UserResponse user;
    private ProjectRole role;
    private LocalDateTime joinedAt;

    public ProjectMemberResponse(String id, LocalDateTime joinedAt, ProjectRole role, UserResponse user) {
        this.joinedAt = joinedAt;
        this.role = role;
        this.user = user;
    }

    public ProjectMemberResponse() {
    }

    public ProjectMemberResponse(Long id, Object joinedAt, ProjectRole projectRole, UserResponse user) {

    }

    // Getters and Setters
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public ProjectRole getRole() {
        return role;
    }
    
    public void setRole(ProjectRole role) {
        this.role = role;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}

