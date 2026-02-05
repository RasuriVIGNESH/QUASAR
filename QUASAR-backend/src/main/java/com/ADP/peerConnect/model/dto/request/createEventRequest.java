package com.ADP.peerConnect.model.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

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

    public createEventRequest(String description, String enddate, String endRegisterdate, String name, String startdate, String startRegisterdate) {
        this.description = description;
        Enddate = enddate;
        EndRegisterdate = endRegisterdate;
        this.name = name;
        Startdate = startdate;
        StartRegisterdate = startRegisterdate;
    }

    public @NotBlank @Size(min = 10, max = 1000) String getDescription() {
        return description;
    }

    public void setDescription(@NotBlank @Size(min = 10, max = 1000) String description) {
        this.description = description;
    }

    public String getEnddate() {
        return Enddate;
    }

    public void setEnddate(String enddate) {
        Enddate = enddate;
    }

    public String getEndRegisterdate() {
        return EndRegisterdate;
    }

    public void setEndRegisterdate(String endRegisterdate) {
        EndRegisterdate = endRegisterdate;
    }

    public @NotBlank @Size(min = 5, max = 100) String getName() {
        return name;
    }

    public void setName(@NotBlank @Size(min = 5, max = 100) String name) {
        this.name = name;
    }

    public String getStartdate() {
        return Startdate;
    }

    public void setStartdate(String startdate) {
        Startdate = startdate;
    }

    public String getStartRegisterdate() {
        return StartRegisterdate;
    }

    public void setStartRegisterdate(String startRegisterdate) {
        StartRegisterdate = startRegisterdate;
    }
}
