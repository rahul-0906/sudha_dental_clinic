package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Represents a medication line item within a visit prescription.
 * Each prescription line links a visit to a medication with quantity and unit price at time of dispensing.
 */
@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "visit_id", nullable = false)
    private Visit visit;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(nullable = false)
    private Integer quantityDispensed;

    /**
     * Unit selling price captured at time of dispensing to preserve historical accuracy.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
}
