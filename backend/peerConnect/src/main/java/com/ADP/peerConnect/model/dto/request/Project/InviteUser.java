package com.ADP.peerConnect.model.dto.request.Project;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class InviteUser {
    @JsonProperty("InvitedId")
    private String InvitedId;
    private String message;
}