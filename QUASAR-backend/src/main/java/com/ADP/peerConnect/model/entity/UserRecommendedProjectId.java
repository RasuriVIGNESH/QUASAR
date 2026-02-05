package com.ADP.peerConnect.model.entity;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserRecommendedProjectId implements Serializable {

    @Column(name = "user_id")
    private String userId;

    @Column(name = "project_id")
    private String projectId;  // Changed from Long to String

    public UserRecommendedProjectId() {
    }

    public UserRecommendedProjectId(String userId, String projectId) {
        this.userId = userId;
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRecommendedProjectId that = (UserRecommendedProjectId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(projectId, that.projectId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, projectId);
    }
}