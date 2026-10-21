package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.ProjectSkillCoverageStatus;
import com.ADP.peerConnect.model.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSkillCoverageResponse {
    private Long skillId;
    private String skillName;
    private String category;
    private SkillLevel requiredLevel;
    private ProjectSkillCoverageStatus coverageStatus;
    private String coverageNote;
    private int membersListingSkill;
    private int membersMeetingRequiredLevel;
    private List<ProjectSkillMemberEvidenceResponse> memberEvidence;
}
