package com.ADP.peerConnect.exception;

/** Domain-specific conflict for DuplicateJoinRequest. */
public final class DuplicateJoinRequestException extends ConflictException {
    public DuplicateJoinRequestException() {
        super("A join request is already pending for this project.");
    }
}
