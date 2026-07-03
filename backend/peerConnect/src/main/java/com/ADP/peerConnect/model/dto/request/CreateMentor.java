package com.ADP.peerConnect.model.dto.request;


import jakarta.validation.constraints.Email;
import lombok.*;

@Data
public class CreateMentor {
    @Email
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String designation;

}
