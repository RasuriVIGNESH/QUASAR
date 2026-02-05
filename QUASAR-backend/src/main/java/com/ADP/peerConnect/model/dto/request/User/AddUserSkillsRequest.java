package com.ADP.peerConnect.model.dto.request.User;

import javax.validation.constraints.NotEmpty;
import javax.validation.Valid;
import java.util.List;

/**
 * Request DTO for adding multiple user skills
 */
public class AddUserSkillsRequest {

    @NotEmpty(message = "Skills list must not be empty")
    @Valid
    private List<AddUserSkillRequest> skills;

    public AddUserSkillsRequest() {}

    public List<AddUserSkillRequest> getSkills() {
        return skills;
    }

    public void setSkills(List<AddUserSkillRequest> skills) {
        this.skills = skills;
    }
}
