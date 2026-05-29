package com.sudhadental.clinic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "dentist_id", nullable = false)
    private User dentist;

    @Column(nullable = false)
    private String chiefComplaint;

    @Column(nullable = false)
    private String diagnosis;

    @Column(nullable = false)
    private String procedureCompleted; // e.g., "Filling", "Root Canal", "Extraction", "Teeth Cleaning"

    @Column(nullable = false)
    private Double cost;

    @Column(nullable = false)
    private LocalDateTime date;

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDateTime.now();
        }
    }
}
