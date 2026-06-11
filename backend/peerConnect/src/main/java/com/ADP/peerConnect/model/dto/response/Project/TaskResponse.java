package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.entity.Task;
import com.ADP.peerConnect.model.enums.TaskPriority;
import com.ADP.peerConnect.model.enums.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskResponse {
    private String title;
    private String description;
    private String projectId;
//    private String assignedToId;
    private String assignedToName;
//    private String createdById;
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

    public TaskResponse() {}

    public TaskResponse(Task task) {
//        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.projectId = task.getProject().getId();
//        this.assignedToId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        this.assignedToName = task.getAssignedTo() != null ?
                task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : null;
//        this.createdById = task.getCreatedBy().getId();
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
    // Getters and setters
//    public String getId() { return id; }
//    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

//    public String getAssignedToId() { return assignedToId; }
//    public void setAssignedToId(String assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

//    public String getCreatedById() { return createdById; }
//    public void setCreatedById(String createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public Integer getActualHours() { return actualHours; }
    public void setActualHours(Integer actualHours) { this.actualHours = actualHours; }

    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }
}