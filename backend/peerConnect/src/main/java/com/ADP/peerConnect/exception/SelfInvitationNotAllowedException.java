package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for SelfInvitationNotAllowed. */
public final class SelfInvitationNotAllowedException extends BadRequestException {
    public SelfInvitationNotAllowedException() {
        super("You cannot invite yourself to your own project.");
    }
}
