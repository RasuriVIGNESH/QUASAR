package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for RoleSelectionRequired. */
public final class RoleSelectionRequiredException extends BadRequestException {
    public RoleSelectionRequiredException() {
        super("Choose one of this project's open roles.");
    }
}
