package com.ADP.peerConnect.exception;

/** Domain-specific conflict for DuplicateInvitation. */
public final class DuplicateInvitationException extends ConflictException {
    public DuplicateInvitationException() {
        super("An invitation is already pending for this student and project.");
    }
}
