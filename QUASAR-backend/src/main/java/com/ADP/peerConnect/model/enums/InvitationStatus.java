package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the status of a project invitation
 */
public enum InvitationStatus {
    PENDING("Pending response"),
    ACCEPTED("Invitation accepted"),
    REJECTED("Invitation rejected"),
    EXPIRED("Invitation expired"), ;

    private final String description;

    InvitationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if invitation can be responded to
     */
    public boolean canRespond() {
        return this == PENDING;
    }

    /**
     * Check if invitation is final (cannot be changed)
     */
    public boolean isFinal() {
        return this == ACCEPTED || this == REJECTED || this == EXPIRED;
    }
}