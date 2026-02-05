package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.EventStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Event entity representing events/hackathons in the platform
 * FIXED: Renamed from 'event' to 'Event', changed Date to LocalDate
 */
@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_event_status", columnList = "status"),
        @Index(name = "idx_event_start_date", columnList = "start_date"),
        @Index(name = "idx_event_status_start", columnList = "status, start_date")
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatus status = EventStatus.UPCOMING;

    @NotBlank(message = "Event description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000, nullable = false)
    private String description;

    @Column(name = "start_register_date")
    private LocalDate startRegisterDate;

    @Column(name = "end_registration_date")
    private LocalDate endRegistrationDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            mappedBy = "event"
    )
    private List<Project> projects = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Event() {
    }

    public Event(String name, String description, LocalDate startRegisterDate,
                 LocalDate endRegistrationDate, LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.description = description;
        this.startRegisterDate = startRegisterDate;
        this.endRegistrationDate = endRegistrationDate;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartRegisterDate() {
        return startRegisterDate;
    }

    public void setStartRegisterDate(LocalDate startRegisterDate) {
        this.startRegisterDate = startRegisterDate;
    }

    public LocalDate getEndRegistrationDate() {
        return endRegistrationDate;
    }

    public void setEndRegistrationDate(LocalDate endRegistrationDate) {
        this.endRegistrationDate = endRegistrationDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods
    public boolean isUpcoming() {
        LocalDate currentDate = LocalDate.now();
        return this.startDate != null && this.startDate.isAfter(currentDate);
    }

    public boolean isActive() {
        LocalDate currentDate = LocalDate.now();
        return this.startDate != null && this.endDate != null &&
                !this.startDate.isAfter(currentDate) && !this.endDate.isBefore(currentDate);
    }

    public boolean isCompleted() {
        LocalDate currentDate = LocalDate.now();
        return this.endDate != null && this.endDate.isBefore(currentDate);
    }

    public boolean isRegistrationOpen() {
        LocalDate currentDate = LocalDate.now();
        return this.startRegisterDate != null && this.endRegistrationDate != null &&
                !this.startRegisterDate.isAfter(currentDate) &&
                !this.endRegistrationDate.isBefore(currentDate);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Event)) return false;
        Event event = (Event) o;
        return id != null && id.equals(event.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}