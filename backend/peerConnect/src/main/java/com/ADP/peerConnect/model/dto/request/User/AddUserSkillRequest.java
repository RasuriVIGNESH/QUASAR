package com.ADP.peerConnect.model.dto.request.User;

import com.ADP.peerConnect.model.enums.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Add user skill request DTO
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
public class AddUserSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String skillName;

    @NotNull(message = "Skill level is required")
    private SkillLevel level;

    @Size(max = 500, message = "Experience description must not exceed 500 characters")
    private String experience;

    private String category;

}
