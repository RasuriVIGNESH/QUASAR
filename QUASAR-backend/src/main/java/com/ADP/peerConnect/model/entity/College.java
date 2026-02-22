package com.ADP.peerConnect.model.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * College entity representing educational institutions
 */
@Entity
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



    // Constructors
    public College() {
    }

    public College(String name, String location) {
        this.name = name;
        this.location = location;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof College)) return false;
        College college = (College) o;
        return id != null && id.equals(college.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "College{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", location='" + location + '\'' +
                '}';
    }
}