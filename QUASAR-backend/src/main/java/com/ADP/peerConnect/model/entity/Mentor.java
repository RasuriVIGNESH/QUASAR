package com.ADP.peerConnect.model.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Mentor entity representing mentor-specific data for a User
 * A Mentor is NOT a different type of User — it is a role-capability.
 */
@Entity
@Table(
        indexes = {
                @Index(name = "idx_mentor_user", columnList = "user_id"),
                @Index(name = "idx_mentor_active", columnList = "is_active")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_mentor_user", columnNames = {"user_id"})
        }
)
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Core identity – reused everywhere in the system
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Size(max = 100)
    @Column(name = "department", length = 100)
    private String department;

    @Size(max = 100)
    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // =============================
    // Constructors
    // =============================

    public Mentor() {
    }

    public Mentor(User user) {
        this.user = user;
    }

    // =============================
    // Getters / Setters
    // =============================

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // =============================
    // Utility methods
    // =============================

    public String getMentorUserId() {
        return user != null ? user.getId() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Mentor)) return false;
        Mentor mentor = (Mentor) o;
        return id != null && id.equals(mentor.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Mentor{" +
                "id=" + id +
                ", userId=" + getMentorUserId() +
                ", active=" + active +
                '}';
    }
}
