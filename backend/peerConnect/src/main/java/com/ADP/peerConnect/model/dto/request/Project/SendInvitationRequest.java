package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class SendInvitationRequest {
    @NotBlank(message = "Invited user ID is required")
    private String invitedUserId;

    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @NotNull(message = "Role is required")
    private ProjectRole role;
}