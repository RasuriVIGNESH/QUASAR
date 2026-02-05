package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing different types of chat messages
 */
public enum MessageType {
    TEXT("Text message"),
    SYSTEM("System message");

    private final String description;

    MessageType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

