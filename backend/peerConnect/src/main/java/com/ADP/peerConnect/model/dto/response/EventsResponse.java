package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Event;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
public class EventsResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    public EventsResponse(Event event) {
        this.id = event.getId();
        this.name = event.getName();
        this.description = event.getDescription();
        this.status = event.getStatus() != null ? event.getStatus().name() : null;
        this.startDate = event.getStartDate();
        this.endDate = event.getEndDate();
    }

}
