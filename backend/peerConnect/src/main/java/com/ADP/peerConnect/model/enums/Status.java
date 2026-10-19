package com.ADP.peerConnect.model.enums;

import lombok.Getter;

/**
 * Enumeration representing the status of a project invitation
 */
@Getter
public enum Status {
    PENDING("Pending response"),
    ACCEPTED("Invitation accepted"),
    REJECTED("Invitation rejected"),
    EXPIRED("Invitation expired"),
    CANCELLED("Request or invitation cancelled");

    private final String description;

    Status(String description) {
        this.description = description;
    }
    /**
     * Check if invitation is final (cannot be changed)
     */
    public boolean isFinal() {
        return this == ACCEPTED || this == REJECTED || this == EXPIRED || this == CANCELLED;
    }
}
