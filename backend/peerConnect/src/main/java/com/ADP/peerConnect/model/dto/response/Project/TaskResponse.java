package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.entity.Task;
import com.ADP.peerConnect.model.enums.TaskPriority;
import com.ADP.peerConnect.model.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private long id;
    private String title;
    private String description;
    private String projectId;
    private String assignedToName;
    private String createdByName;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private Integer estimatedHours;
    private Integer actualHours;
    private boolean overdue;

    public TaskResponse(Task task) {
        this.id=task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.projectId = task.getProject().getId();
        this.assignedToName = task.getAssignedTo() != null ?
                task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : null;
        this.createdByName = task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.dueDate = task.getDueDate();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
        this.completedAt = task.getCompletedAt();
        this.estimatedHours = task.getEstimatedHours();
        this.actualHours = task.getActualHours();
        this.overdue = task.isOverdue();
    }
}