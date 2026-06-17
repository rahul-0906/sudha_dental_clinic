package com.sudhaclinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for patient checkout.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Consultation fee is required")
    private BigDecimal consultationFee;

    private List<PrescribedItemDTO> prescribedItems;

    private String notes;
}
