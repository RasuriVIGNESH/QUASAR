package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * Invite user to project request DTO
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class InviteUserRequest {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotNull(message = "Project role is required")
    private ProjectRole role;
    
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

}

