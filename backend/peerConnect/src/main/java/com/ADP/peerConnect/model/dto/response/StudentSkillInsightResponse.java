package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillInsightResponse {
    private Long skillId;
    private String skillName;
    private String category;
    private SkillLevel profileLevel;
    private long activeProjectCount;
    private long recruitingProjectCount;
    private long inProgressProjectCount;
}
