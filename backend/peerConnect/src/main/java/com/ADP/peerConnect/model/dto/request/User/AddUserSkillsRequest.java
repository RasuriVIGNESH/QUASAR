package com.ADP.peerConnect.model.dto.request.User;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request DTO for adding multiple user skills
 */

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class AddUserSkillsRequest {

    @NotEmpty(message = "Skills list must not be empty")
    @Valid
    private List<AddUserSkillRequest> skills;

}
