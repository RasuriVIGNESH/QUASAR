package com.ADP.peerConnect.model.dto.request;


import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
public class CreateMentorRequest {
    @Email
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String designation;

}
