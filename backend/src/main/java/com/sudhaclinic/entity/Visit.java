package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a single patient visit / consultation at Sudha Dental Clinic.
 */
@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private LocalDate visitDate;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String consultationNotes;

    @Column
    private String diagnosis;

    @Column(precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column
    private LocalDate nextVisitDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.visitDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = VisitStatus.WAITING;
        }
    }
}
