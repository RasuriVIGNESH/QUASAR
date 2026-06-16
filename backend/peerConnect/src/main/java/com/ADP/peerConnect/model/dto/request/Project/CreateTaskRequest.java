package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CreateTaskRequest {
    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String assignedToId;
    private TaskPriority priority = TaskPriority.MEDIUM;
    private LocalDate dueDate;
    private Integer estimatedHours;
}
