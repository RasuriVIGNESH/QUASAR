package com.ADP.peerConnect.exception;

/** Domain-specific conflict for AlreadyProjectMember. */
public final class AlreadyProjectMemberException extends ConflictException {
    public AlreadyProjectMemberException() {
        super("This student is already a project member.");
    }
}
