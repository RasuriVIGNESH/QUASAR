package com.ADP.peerConnect.model.dto.request.Project;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectSkillRequest {
    // Either skillId or skillName must be provided
    private Long skillId;

    @Size(min = 2, max = 100)
    private String skillName;

    private Boolean required = true;
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public ProjectSkillRequest(String value) {
        this.skillName = value;
        this.required = true;
    }

    @AssertTrue(message = "Either skillId or skillName must be provided")
    public boolean isValid() {
        return (skillId != null) || (skillName != null && !skillName.isBlank());
    }
}
