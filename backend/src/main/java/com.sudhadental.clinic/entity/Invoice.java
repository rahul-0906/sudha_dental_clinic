package com.sudhadental.clinic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private Double paidAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Column(nullable = false)
    private LocalDateTime billingDate;

    @PrePersist
    protected void onCreate() {
        if (billingDate == null) {
            billingDate = LocalDateTime.now();
        }
        if (paidAmount == null) {
            paidAmount = 0.0;
        }
    }
}
