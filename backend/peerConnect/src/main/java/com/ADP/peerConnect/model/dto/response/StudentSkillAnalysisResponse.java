package com.ADP.peerConnect.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillAnalysisResponse {
    private int profileSkillCount;
    private int profileSkillsInDemandCount;
    private List<StudentSkillInsightResponse> profileSkills;
    private List<SkillDemandResponse> highDemandSkillsNotOnProfile;
    private List<ProjectRecommendationResult> recommendedProjects;
}
