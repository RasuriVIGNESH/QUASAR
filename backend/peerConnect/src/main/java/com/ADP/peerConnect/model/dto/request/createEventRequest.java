package com.ADP.peerConnect.model.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class createEventRequest {

    @NotBlank
    @Size(min = 5, max = 100)
    private String name;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    private String StartRegisterdate;
    private String EndRegisterdate;
    private String Startdate;
    private String Enddate;
}
