package com.sudhaclinic.dto;

import com.sudhaclinic.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Transaction create requests and list responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {

    private Long id;

    private LocalDate transactionDate;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    private String category;

    private String description;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    /** Optional: linked visit ID for income traceability */
    private Long visitId;

    private LocalDateTime createdAt;
}
