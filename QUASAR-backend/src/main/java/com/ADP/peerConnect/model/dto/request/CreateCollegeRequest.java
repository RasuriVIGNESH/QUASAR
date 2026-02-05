package com.ADP.peerConnect.model.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateCollegeRequest {

    @NotBlank(message = "College name is required")
    @Size(min = 3, max = 100, message = "College name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
    private String location;

    @NotBlank(message = "College code is required")
    @Size(min = 2, max = 20, message = "College code must be between 2 and 20 characters")
    private String clgCode;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getClgCode() {
        return clgCode;
    }

    public void setClgCode(String clgCode) {
        this.clgCode = clgCode;
    }
}