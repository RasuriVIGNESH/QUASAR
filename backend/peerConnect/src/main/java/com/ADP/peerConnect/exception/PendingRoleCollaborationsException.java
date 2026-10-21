package com.ADP.peerConnect.exception;

/** Domain-specific conflict for PendingRoleCollaborations. */
public final class PendingRoleCollaborationsException extends ConflictException {
    public PendingRoleCollaborationsException() {
        super("Resolve pending invitations or join requests for this role before marking it filled.");
    }
}
