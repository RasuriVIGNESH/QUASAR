package com.ADP.peerConnect.model.dto.request.Project;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
public class CreateMeetingRoomRequest {

    @NotBlank(message = "Room name is required")
    @Size(max = 100, message = "Room name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;
}
