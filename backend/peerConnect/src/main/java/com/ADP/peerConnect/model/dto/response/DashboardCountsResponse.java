package com.ADP.peerConnect.model.dto.response;

/**
 * Response DTO that holds dashboard counts shown on frontend
 */
public class DashboardCountsResponse {
    private long projectsCount;
    private long skillsCount;

    public DashboardCountsResponse() {}

    public DashboardCountsResponse(long projectsCount, long skillsCount) {
        this.projectsCount = projectsCount;
        this.skillsCount = skillsCount;
    }

    public long getProjectsCount() {
        return projectsCount;
    }

    public void setProjectsCount(long projectsCount) {
        this.projectsCount = projectsCount;
    }

    public long getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(long skillsCount) {
        this.skillsCount = skillsCount;
    }
}

