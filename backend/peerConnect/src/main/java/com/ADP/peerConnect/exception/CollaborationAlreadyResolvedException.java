package com.ADP.peerConnect.exception;

/** Domain-specific conflict for CollaborationAlreadyResolved. */
public final class CollaborationAlreadyResolvedException extends ConflictException {
    public CollaborationAlreadyResolvedException() {
        super("This collaboration request or invitation has already been responded to.");
    }
}
