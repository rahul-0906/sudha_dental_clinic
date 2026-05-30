package com.sudhaclinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

/**
 * Represents a medication / dental supply item in the clinic inventory.
 * category: 'DENTAL' for dental consumables, 'MEDICINE' for pharmaceutical drugs.
 */
@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Medication name is required")
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * Category: DENTAL or MEDICINE
     */
    @Column
    private String category;

    /**
     * Unit of dispensing, e.g. Tablet, Capsule, Cartridge, Pack, Syringe, Roll, Box
     */
    @Column
    private String unit;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentStock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reorderLevel = 10;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitCostPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitSellingPrice;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
