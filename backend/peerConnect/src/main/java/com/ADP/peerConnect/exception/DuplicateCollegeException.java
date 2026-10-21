package com.ADP.peerConnect.exception;

/** Domain-specific exception for DuplicateCollege. */
public final class DuplicateCollegeException extends ConflictException {
    public DuplicateCollegeException() {
        super("A college with this name or code already exists.");
    }
}
