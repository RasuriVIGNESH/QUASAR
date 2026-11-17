package com.ADP.peerConnect.exception;

/** Raised when a project's expected dates are contradictory. */
public final class InvalidProjectScheduleException extends BadRequestException {
    public InvalidProjectScheduleException() {
        super("Project expected start date must be on or before the expected end date.");
    }
}
