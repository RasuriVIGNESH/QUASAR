package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.EventStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Event entity representing events/hackathons in the platform
 * FIXED: Renamed from 'event' to 'Event', changed Date to LocalDate
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
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

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "event")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Project> projects = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;



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
}