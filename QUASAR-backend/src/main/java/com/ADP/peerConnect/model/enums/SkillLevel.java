package com.ADP.peerConnect.model.enums;

/**
 * Enumeration representing the skill level of a user for a particular skill
 */
public enum SkillLevel {
    VIBE_CODING("Vibe Coding level"),
    BEGINNER("Beginner level"),
    INTERMEDIATE("Intermediate level"),
    ADVANCED("Advanced level");


    private final String description;

    SkillLevel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

