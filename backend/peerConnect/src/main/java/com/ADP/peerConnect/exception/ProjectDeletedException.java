package com.ADP.peerConnect.exception;

public class ProjectDeletedException extends RuntimeException {
    public ProjectDeletedException(String projectId) {
        super("Project " + projectId + " has been deleted and is no longer available.");
    }
}
