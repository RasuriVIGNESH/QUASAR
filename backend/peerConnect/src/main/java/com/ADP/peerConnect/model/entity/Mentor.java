package com.ADP.peerConnect.model.entity;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Mentor entity representing mentor-specific data for a User
 * A Mentor is NOT a different type of User — it is a role-capability.
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
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

}
