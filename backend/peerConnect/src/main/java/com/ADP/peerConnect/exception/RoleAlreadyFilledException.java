package com.ADP.peerConnect.exception;

/** Domain-specific conflict for RoleAlreadyFilled. */
public final class RoleAlreadyFilledException extends ConflictException {
    public RoleAlreadyFilledException() {
        super("This project role has already been filled.");
    }
}
