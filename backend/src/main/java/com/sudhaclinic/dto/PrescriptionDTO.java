package com.sudhaclinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO representing a single prescription line item (medication + quantity).
 * Used inside VisitDTO and CheckoutRequest.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDTO {

    private Long id;

    private Long medicationId;

    /** Medication name for display */
    private String medicationName;

    /** Unit of measure from the Medication entity */
    private String unit;

    private Integer quantityDispensed;

    /** Unit price captured at time of dispensing */
    private BigDecimal unitPrice;

    /** Total line amount = quantityDispensed * unitPrice */
    private BigDecimal lineTotal;
}
