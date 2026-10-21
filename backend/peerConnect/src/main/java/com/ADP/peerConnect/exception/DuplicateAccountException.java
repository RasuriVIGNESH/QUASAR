package com.ADP.peerConnect.exception;

/** Domain-specific conflict for DuplicateAccount. */
public final class DuplicateAccountException extends ConflictException {
    public DuplicateAccountException() {
        super("An account with this email already exists.");
    }
}
