package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.TaskPriority;
import com.ADP.peerConnect.model.enums.TaskStatus;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_project", columnList = "project_id"),
        @Index(name = "idx_task_assignee", columnList = "assigned_to_id"),
        @Index(name = "idx_task_status", columnList = "status"),
        @Index(name = "idx_task_priority", columnList = "priority"),
        @Index(name = "idx_task_due_date", columnList = "due_date"),
        @Index(name = "idx_task_project_status", columnList = "project_id, status"),
        @Index(name = "idx_task_status_due_date", columnList = "status, due_date"),
        @Index(name = "idx_task_assignee_status", columnList = "assigned_to_id, status")
})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "task_seq")
    @SequenceGenerator(name = "task_seq", sequenceName = "task_seq", allocationSize = 1)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 200, message = "Task title must be between 3 and 200 characters")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @Size(max = 1000, message = "Task description must not exceed 1000 characters")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    @NotNull(message = "Task creator is required")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_id")
    private User completedBy;

    @Column(name = "estimated_hours")
    private Integer estimatedHours;

    @Column(name = "actual_hours")
    private Integer actualHours;

    public Task(String title, String description, Project project, User createdBy) {
        this.title = title;
        this.description = description;
        this.project = project;
        this.createdBy = createdBy;
    }
    public void setStatus(TaskStatus status) {
        this.status = status;
        if (status == TaskStatus.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        } else if (status != TaskStatus.COMPLETED) {
            this.completedAt = null;
            this.completedBy = null;
        }
    }

    public boolean isCompleted() {
        return status == TaskStatus.COMPLETED;
    }
    public boolean isOverdue() {
        return dueDate != null && dueDate.isBefore(LocalDate.now()) && !isCompleted();
    }
    public void complete(User completedBy) {
        setStatus(TaskStatus.COMPLETED);
        this.completedBy = completedBy;
        this.completedAt = LocalDateTime.now();
    }

}