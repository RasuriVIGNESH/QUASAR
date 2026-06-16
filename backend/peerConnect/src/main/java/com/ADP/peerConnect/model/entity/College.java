package com.ADP.peerConnect.model.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * College entity representing educational institutions
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@Table(name = "colleges", indexes = {
        @Index(name = "idx_college_name", columnList = "name")
})
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @NotBlank(message = "College name is required")
    @Size(max = 200, message = "College name must not exceed 200 characters")
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    @Column(name = "location", length = 200)
    private String location;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "college", fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();



        public College(String name, String location) {
        this.name = name;
        this.location = location;
    }

}