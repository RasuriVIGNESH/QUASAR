package com.ADP.peerConnect.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "portfolio_entries",
        indexes = { @Index(name = "idx_portfolio_project_created", columnList = "project_id,created_at"),
                    @Index(name = "idx_portfolio_owner", columnList = "owner_id") },
        uniqueConstraints = { @UniqueConstraint(name = "uk_portfolio_owner_project_title", columnNames = {"owner_id","project_id","title"}) })
public class PortfolioEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "owner_id", nullable = false) private User owner;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id", nullable = false) private Project project;
    @NotBlank @Size(max = 160) @Column(name = "title", nullable = false, length = 160) private String title;
    @NotBlank @Size(max = 2048) @Column(name = "url", nullable = false, length = 2048) private String url;
    @Size(max = 2000) @Column(name = "description", length = 2000) private String description;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    public PortfolioEntry(User owner, Project project, String title, String url, String description) {
        this.owner=owner; this.project=project; this.title=title; this.url=url; this.description=description;
    }
}
