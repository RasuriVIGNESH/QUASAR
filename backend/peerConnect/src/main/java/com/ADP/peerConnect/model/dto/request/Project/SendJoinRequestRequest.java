package com.ADP.peerConnect.model.dto.request.Project;


import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class SendJoinRequestRequest {

    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;
}