package com.ADP.peerConnect.model.dto.request.User;

import com.ADP.peerConnect.model.enums.SkillLevel;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Update user skill request DTO
 */
public class UpdateUserSkillRequest {

    @NotNull(message = "Skill level is required")
    private SkillLevel level;

    @Size(max = 500, message = "Experience description must not exceed 500 characters")
    private String experience;

    public UpdateUserSkillRequest() {}

    // Getters and Setters
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

    @Override
    public String toString() {
        return "UpdateUserSkillRequest{" +
                "level=" + level +
                ", experience='" + experience + '\'' +
                '}';
    }
}