package com.ADP.peerConnect.model.dto.request.Project;

public class ToggleTaskRequest {
    private boolean completed;

    public ToggleTaskRequest() {}

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}