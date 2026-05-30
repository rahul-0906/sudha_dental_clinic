package com.sudhaclinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a financial transaction (income or expense) in the clinic ledger.
 * Income transactions are auto-created during checkout.
 * Expense transactions are entered manually by clinic staff.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @Column
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Amount is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * Optionally linked to a patient visit for income traceability.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.transactionDate == null) {
            this.transactionDate = LocalDate.now();
        }
    }
}
