package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSkillAnalysisResponse {
    private String projectId;
    private String projectTitle;
    private ProjectStatus projectStatus;
    private int teamMemberCount;
    private int teamMembersWithSkillProfiles;
    private int teamMembersWithoutSkillProfiles;
    private int requiredSkillCount;
    private int coveredSkillCount;
    private int partiallyCoveredSkillCount;
    private int notListedSkillCount;
    private int unknownSkillCount;
    private List<ProjectSkillCoverageResponse> requiredSkills;
}
