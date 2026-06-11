package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.College;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CollegeResponse {

    private Long id;
    private String name;
    private String location;

    public CollegeResponse() {}

    public CollegeResponse(College college) {
        if (college != null) {
            this.id = college.getId();
            this.name = college.getName();
            this.location = college.getLocation();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}