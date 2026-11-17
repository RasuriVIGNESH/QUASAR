package com.ADP.peerConnect.exception;

/** Raised when a user already has a skill or a bulk request repeats one. */
public final class DuplicateUserSkillException extends ConflictException {
    public DuplicateUserSkillException(String skillName) {
        super("User already has the skill: " + skillName);
    }
}
