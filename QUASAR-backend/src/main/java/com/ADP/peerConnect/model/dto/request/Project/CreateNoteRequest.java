package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateNoteRequest {

    @NotBlank(message = "Note title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String content;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
