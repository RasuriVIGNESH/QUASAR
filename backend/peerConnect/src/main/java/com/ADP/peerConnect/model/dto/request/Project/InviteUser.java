package com.ADP.peerConnect.model.dto.request.Project;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InviteUser {
    @JsonProperty("InvitedId")
    @JsonAlias("invitedId")
    @NotBlank(message = "InvitedId is required")
    private String invitedId;

    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @Positive(message = "roleId must be a positive integer")
    private Long roleId;
}
