package com.sudhaclinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a patient registered at Sudha Dental Clinic.
 */
@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Phone number is required")
    @Column(nullable = false, unique = true)
    private String phone;

    @Column
    private LocalDate dob;

    @Column
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
