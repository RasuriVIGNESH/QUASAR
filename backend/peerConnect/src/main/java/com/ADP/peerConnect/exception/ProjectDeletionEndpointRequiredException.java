package com.ADP.peerConnect.exception;

/** Domain-specific exception for ProjectDeletionEndpointRequired. */
public final class ProjectDeletionEndpointRequiredException extends BadRequestException {
    public ProjectDeletionEndpointRequiredException() {
        super("Use the delete endpoint to mark a project deleted.");
    }
}
