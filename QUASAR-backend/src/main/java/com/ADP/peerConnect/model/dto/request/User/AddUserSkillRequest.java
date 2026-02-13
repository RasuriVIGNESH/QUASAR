package com.ADP.peerConnect.model.dto.request.User;

import com.ADP.peerConnect.model.enums.SkillLevel;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Add user skill request DTO
 */
public class AddUserSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String skillName;

    @NotNull(message = "Skill level is required")
    private SkillLevel level;

    @Size(max = 500, message = "Experience description must not exceed 500 characters")
    private String experience;

    public AddUserSkillRequest() {
    }

    // Getters and Setters
    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    private String category;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
