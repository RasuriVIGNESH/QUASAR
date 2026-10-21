package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSkillMemberEvidenceResponse {
    private String userId;
    private String displayName;
    private boolean projectLead;
    private SkillLevel profileLevel;
    /** Null means the project did not specify a required proficiency level. */
    private Boolean meetsRequiredLevel;
}
