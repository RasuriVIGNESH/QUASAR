package com.ADP.peerConnect.exception;

/** Domain-specific conflict for AlreadyProjectLead. */
public final class AlreadyProjectLeadException extends ConflictException {
    public AlreadyProjectLeadException() {
        super("This user is already the project lead.");
    }
}
