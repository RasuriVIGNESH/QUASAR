package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the status of a task
 */
public enum TaskStatus {
    TODO("To Do"),
    IN_PROGRESS("In Progress"),
    IN_REVIEW("In Review"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == TODO || this == IN_PROGRESS || this == IN_REVIEW;
    }

    public boolean isFinal() {
        return this == COMPLETED || this == CANCELLED;
    }
}

