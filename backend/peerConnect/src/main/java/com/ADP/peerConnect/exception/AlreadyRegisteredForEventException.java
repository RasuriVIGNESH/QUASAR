package com.ADP.peerConnect.exception;

/** Domain-specific conflict for AlreadyRegisteredForEvent. */
public final class AlreadyRegisteredForEventException extends ConflictException {
    public AlreadyRegisteredForEventException() {
        super("You are already registered for this event.");
    }
}
