package com.sudhadental.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "treatment_record_id", nullable = false)
    private TreatmentRecord treatmentRecord;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage; // e.g., "500mg"

    @Column(nullable = false)
    private String duration; // e.g., "5 days"

    private String instructions; // e.g., "After meals, twice a day"
}
