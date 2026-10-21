package com.ADP.peerConnect.exception;

/** Domain-specific invalid request for TaskAssigneeNotProjectMember. */
public final class TaskAssigneeNotProjectMemberException extends BadRequestException {
    public TaskAssigneeNotProjectMemberException() {
        super("Tasks can only be assigned to project members or the project lead.");
    }
}
