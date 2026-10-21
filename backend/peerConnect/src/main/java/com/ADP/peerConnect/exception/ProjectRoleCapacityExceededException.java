package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for ProjectRoleCapacityExceeded. */
public final class ProjectRoleCapacityExceededException extends BadRequestException {
    public ProjectRoleCapacityExceededException() {
        super("Required roles cannot exceed the team seats available after the project lead.");
    }
}
