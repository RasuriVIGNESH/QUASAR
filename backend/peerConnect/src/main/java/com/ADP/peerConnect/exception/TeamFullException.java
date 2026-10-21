package com.ADP.peerConnect.exception;

/** Domain-specific conflict for TeamFull. */
public final class TeamFullException extends ConflictException {
    public TeamFullException() {
        super("This project's team is already full.");
    }
}
