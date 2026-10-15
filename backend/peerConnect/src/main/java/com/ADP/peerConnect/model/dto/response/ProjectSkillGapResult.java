package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSkillGapResult {
    private Long skillId;
    private String skillName;
    private SkillLevel requiredLevel;
    private String coverage; // MISSING, NEEDS_MORE, or COVERED
    private List<String> coveredBy;
}
