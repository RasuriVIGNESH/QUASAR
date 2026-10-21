package com.ADP.peerConnect.exception;

/** Domain-specific conflict for ProjectRoleHistoryConflict. */
public final class ProjectRoleHistoryConflictException extends ConflictException {
    public ProjectRoleHistoryConflictException() {
        super("A role referenced by collaboration history cannot be renamed or removed.");
    }
}
