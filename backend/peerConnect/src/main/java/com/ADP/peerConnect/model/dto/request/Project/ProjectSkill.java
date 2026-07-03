package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.SkillLevel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectSkill {
    @Size(min = 2, max = 100)
    private String skillName;
    private SkillLevel level;
}
