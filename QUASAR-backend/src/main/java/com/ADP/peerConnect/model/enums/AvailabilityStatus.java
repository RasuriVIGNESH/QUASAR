package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the availability status of a user
 */
public enum AvailabilityStatus {
    AVAILABLE("Available for new projects"),
    BUSY("Currently busy with existing projects"),
    NOT_AVAILABLE("Not available for projects");

    private final String description;

    AvailabilityStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

