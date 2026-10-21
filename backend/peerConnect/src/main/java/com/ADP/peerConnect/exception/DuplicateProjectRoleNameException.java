package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for DuplicateProjectRoleName. */
public final class DuplicateProjectRoleNameException extends BadRequestException {
    public DuplicateProjectRoleNameException() {
        super("Duplicate role names are not allowed within a project.");
    }
}
