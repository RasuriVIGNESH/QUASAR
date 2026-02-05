package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import javax.validation.constraints.NotNull;

public class UpdateMemberRoleRequest {
    @NotNull(message = "Role is required")
    private ProjectRole role;

    public UpdateMemberRoleRequest() {}

    public ProjectRole getRole() { return role; }
    public void setRole(ProjectRole role) { this.role = role; }
}