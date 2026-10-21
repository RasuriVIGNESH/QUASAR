package com.ADP.peerConnect.exception;

/** Domain-specific exception for InvalidCollaborationDecision. */
public final class InvalidCollaborationDecisionException extends BadRequestException {
    public InvalidCollaborationDecisionException() {
        super("response must be ACCEPTED or REJECTED.");
    }
}
