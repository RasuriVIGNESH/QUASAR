package com.ADP.peerConnect.exception;

/** Domain-specific conflict for DuplicateSkill. */
public final class DuplicateSkillException extends ConflictException {
    public DuplicateSkillException() {
        super("A skill with this name already exists.");
    }
}
