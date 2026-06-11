package com.ADP.peerConnect.model.dto.request.Project;

import java.util.List;

public class RecommendedCandidateRequest {
    private String userId;
    private Float matchScore;
    private Integer priority;
    private List<String> missingSkills;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Float getMatchScore() { return matchScore; }
    public void setMatchScore(Float matchScore) { this.matchScore = matchScore; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
}
