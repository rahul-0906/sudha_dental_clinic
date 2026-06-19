package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private LocalDate invoiceDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount;

    private String status; // PAID, PENDING, etc.

    @PrePersist
    public void prePersist() {
        if (this.invoiceDate == null) {
            this.invoiceDate = LocalDate.now();
        }
    }
}
