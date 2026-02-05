package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class SendInvitationRequest {
    @NotBlank(message = "Invited user ID is required")
    private String invitedUserId;

    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @NotNull(message = "Role is required")
    private ProjectRole role;

    // Constructors, getters, setters
    public SendInvitationRequest() {}

    public String getInvitedUserId() { return invitedUserId; }
    public void setInvitedUserId(String invitedUserId) { this.invitedUserId = invitedUserId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public ProjectRole getRole() { return role; }
    public void setRole(ProjectRole role) { this.role = role; }
}