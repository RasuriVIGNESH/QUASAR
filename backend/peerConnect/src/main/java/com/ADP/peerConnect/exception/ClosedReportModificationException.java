package com.ADP.peerConnect.exception;

/** Domain-specific conflict for ClosedReportModification. */
public final class ClosedReportModificationException extends ConflictException {
    public ClosedReportModificationException() {
        super("A closed report cannot be changed.");
    }
}
