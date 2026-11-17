package com.ADP.peerConnect.exception;

/** Raised when a bulk user-skill item is malformed. */
public final class InvalidUserSkillException extends BadRequestException {
    public InvalidUserSkillException(String message) {
        super(message);
    }
}
