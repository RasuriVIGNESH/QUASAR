package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class AddMemberRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Role is required")
    private ProjectRole role;

    public AddMemberRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public ProjectRole getRole() { return role; }
    public void setRole(ProjectRole role) { this.role = role; }
}