package com.ADP.peerConnect.exception;

/** Domain-specific conflict for ProjectLeadCannotBeRemoved. */
public final class ProjectLeadCannotBeRemovedException extends ConflictException {
    public ProjectLeadCannotBeRemovedException() {
        super("The project lead cannot be removed from the project.");
    }
}
