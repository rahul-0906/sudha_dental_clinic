package com.sudhaclinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request body for the checkout endpoint.
 * Atomically saves prescriptions, deducts inventory, and creates income transactions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotNull(message = "Visit ID is required")
    private Long visitId;

    private BigDecimal consultationFee;

    private String consultationNotes;

    private String diagnosis;

    /** Optional: schedule the patient's next visit */
    private LocalDate nextVisitDate;

    /** List of medication items to dispense as part of this checkout */
    private List<PrescriptionItem> prescriptions;

    /**
     * Nested DTO representing a single prescription line in the checkout request.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrescriptionItem {

        @NotNull(message = "Medication ID is required")
        private Long medicationId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}
