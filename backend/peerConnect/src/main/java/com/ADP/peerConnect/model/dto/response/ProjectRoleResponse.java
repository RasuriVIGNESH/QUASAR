package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.ProjectRole;

public record ProjectRoleResponse(Long id, String name, boolean filled) {
    public static ProjectRoleResponse from(ProjectRole role) {
        return new ProjectRoleResponse(role.getId(), role.getName(), role.isFilled());
    }
}
