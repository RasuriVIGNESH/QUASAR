package com.ADP.peerConnect.exception;

/** Domain-specific exception for ProjectSkillRequired. */
public final class ProjectSkillRequiredException extends BadRequestException {
    public ProjectSkillRequiredException() {
        super("Every project skill must have a non-blank name.");
    }
}
