package com.ADP.peerConnect.model.dto.response.event;

import com.ADP.peerConnect.model.entity.Project;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class EvnentResponse {

    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private List<Project> projects;

}
