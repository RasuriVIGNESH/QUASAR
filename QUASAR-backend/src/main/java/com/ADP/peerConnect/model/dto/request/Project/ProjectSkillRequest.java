package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.constraints.Size;
import javax.validation.constraints.AssertTrue;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectSkillRequest {
    // Either skillId or skillName must be provided
    private Long skillId;

    @Size(min = 2, max = 100)
    private String skillName;

    private Boolean required = true;

    public ProjectSkillRequest() {}

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public ProjectSkillRequest(String value) {
        // allow deserializing plain string -> skillName
        this.skillName = value;
        this.required = true;
    }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public Boolean getRequired() { return required; }
    public void setRequired(Boolean required) { this.required = required; }

    @AssertTrue(message = "Either skillId or skillName must be provided")
    public boolean isValid() {
        return (skillId != null) || (skillName != null && !skillName.isBlank());
    }
}
