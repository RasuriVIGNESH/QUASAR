package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the role of a user in a project
 */
public enum ProjectRole {
    LEAD("Project Lead"),
    MEMBER("Team Member");

    private final String description;

    ProjectRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
