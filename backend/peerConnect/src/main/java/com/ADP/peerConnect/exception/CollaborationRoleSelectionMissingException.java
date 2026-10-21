package com.ADP.peerConnect.exception;

/** Domain-specific exception for CollaborationRoleSelectionMissing. */
public final class CollaborationRoleSelectionMissingException extends ConflictException {
    public CollaborationRoleSelectionMissingException() {
        super("This pending collaboration record does not specify a required role. Submit a new role-specific request.");
    }
}
