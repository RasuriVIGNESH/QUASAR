package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the status of a project
 */
public enum ProjectStatus {
    RECRUITING("Recruiting team members"),
    IN_PROGRESS("Currently in progress"),
    COMPLETED("Project completed"),
    CANCELLED("Project cancelled");

    private final String description;

    ProjectStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if project can accept new members
     */
    public boolean canAcceptMembers() {
        return this == RECRUITING;
    }

    /**
     * Check if project is active
     */
    public boolean isActive() {
        return this == RECRUITING || this == IN_PROGRESS;
    }

    /**
     * Check if project is finished
     */
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED;
    }
}