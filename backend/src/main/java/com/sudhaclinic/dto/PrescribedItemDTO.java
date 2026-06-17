package com.sudhaclinic.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing an item prescribed during consultation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescribedItemDTO {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;
}
