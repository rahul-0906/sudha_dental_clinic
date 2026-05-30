package com.sudhaclinic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Medication create/update requests and responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDTO {

    private Long id;

    @NotBlank(message = "Medication name is required")
    private String name;

    /** DENTAL or MEDICINE */
    private String category;

    /** Unit: Tablet, Capsule, Cartridge, Pack, Syringe, Roll, Box */
    private String unit;

    @NotNull(message = "Current stock is required")
    private Integer currentStock;

    private Integer reorderLevel;

    private BigDecimal unitCostPrice;

    private BigDecimal unitSellingPrice;

    private boolean isActive;

    /** Computed field: true if currentStock <= reorderLevel */
    private boolean lowStock;
}
