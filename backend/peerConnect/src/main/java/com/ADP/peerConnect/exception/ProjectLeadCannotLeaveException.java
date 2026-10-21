package com.ADP.peerConnect.exception;

/** Domain-specific conflict for ProjectLeadCannotLeave. */
public final class ProjectLeadCannotLeaveException extends ConflictException {
    public ProjectLeadCannotLeaveException() {
        super("The project lead cannot leave the project. Transfer leadership first or delete the project.");
    }
}
