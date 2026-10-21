package com.ADP.peerConnect.exception;

/** Domain-specific exception for DuplicateProjectRoleId. */
public final class DuplicateProjectRoleIdException extends BadRequestException {
    public DuplicateProjectRoleIdException() {
        super("A role ID may appear only once in requiredRoles.");
    }
}
