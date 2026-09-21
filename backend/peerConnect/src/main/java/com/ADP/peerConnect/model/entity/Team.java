package com.ADP.peerConnect.model.entity;

import jakarta.persistence.*;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@Table(
        name = "teams",
        indexes = {
                @Index(name = "idx_team_project", columnList = "project_id"),
                @Index(name = "idx_team_lead",    columnList = "lead_id")
        }
)
public class Team {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @UuidGenerator
    private String id;

    @OneToOne
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    @NotNull
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    @NotNull
    private User lead;


    @BatchSize(size = 25)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "team_members",
            joinColumns        = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"),
            indexes = {
                    @Index(name = "idx_team_members_team", columnList = "team_id"),
                    @Index(name = "idx_team_members_user", columnList = "user_id")
            }
    )
    private Set<User> members = new HashSet<>();
}