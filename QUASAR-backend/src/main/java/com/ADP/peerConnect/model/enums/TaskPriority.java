package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the priority of a task
 */
public enum TaskPriority {
    LOW("Low Priority"),
    MEDIUM("Medium Priority"),
    HIGH("High Priority"),
    CRITICAL("Critical Priority");

    private final String description;

    TaskPriority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public int getLevel() {
        return this.ordinal();
    }
}
