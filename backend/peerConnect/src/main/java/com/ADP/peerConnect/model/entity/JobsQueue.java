package com.ADP.peerConnect.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@Table(name = "jobs_queue")
public class JobsQueue {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "job_type", length = 50)
    private String jobType;

    // Store JSON payload as text for portability; column type is jsonb in Postgres
    @Column(columnDefinition = "jsonb")
    private String payload;

    @Column(length = 20)
    private String status = "pending";

    @Column(name = "error_message")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}