package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.constraints.Size;

public class SendJoinRequestRequest {

    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    public SendJoinRequestRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}