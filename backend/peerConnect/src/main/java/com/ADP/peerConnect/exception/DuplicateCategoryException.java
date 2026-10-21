package com.ADP.peerConnect.exception;

/** Domain-specific conflict for DuplicateCategory. */
public final class DuplicateCategoryException extends ConflictException {
    public DuplicateCategoryException() {
        super("A category with this name already exists.");
    }
}
