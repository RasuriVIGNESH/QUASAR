package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.College;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CollegeResponse {

    private Long id;
    private String name;
    private String location;

    public CollegeResponse(College college) {
    }
}