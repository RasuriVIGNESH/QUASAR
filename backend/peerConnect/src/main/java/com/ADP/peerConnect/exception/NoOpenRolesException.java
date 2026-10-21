package com.ADP.peerConnect.exception;

/** Raised when a project has required roles but none remain open. */
public final class NoOpenRolesException extends ConflictException {
    public NoOpenRolesException() {
        super("There are no open roles on this project. Add an open role before sending an invitation or join request.");
    }
}
