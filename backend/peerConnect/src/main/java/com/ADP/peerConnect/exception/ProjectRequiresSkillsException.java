package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for ProjectRequiresSkills. */
public final class ProjectRequiresSkillsException extends BadRequestException {
    public ProjectRequiresSkillsException() {
        super("A project must have at least one required skill.");
    }
}
