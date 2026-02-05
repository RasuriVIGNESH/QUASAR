package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing different types of notifications
 */
public enum NotificationType {
    PROJECT_INVITATION("Project invitation received"),
    INVITATION_ACCEPTED("Project invitation accepted"),
    INVITATION_REJECTED("Project invitation rejected"),
    MEMBER_JOINED("New member joined project"),
    MEMBER_LEFT("Member left project"),
    PROJECT_UPDATE("Project update notification"),
    TEAM_UPDATE("Team update notification"),
    MESSAGE("New message notification"),
    SYSTEM("System notification");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

