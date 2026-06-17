package com.sudhaclinic.service;

import com.sudhaclinic.dto.CheckoutRequestDTO;
import com.sudhaclinic.dto.PrescribedItemDTO;
import com.sudhaclinic.entity.*;
import com.sudhaclinic.exception.InsufficientStockException;
import com.sudhaclinic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Service to handle patient checkout process atomically.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final VisitRepository visitRepository;
    private final InventoryRepository inventoryRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LedgerRepository ledgerRepository;

    /**
     * Atomically processes patient checkout.
     * Updates visit status, deducts inventory, and records ledger entries.
     *
     * @param request the checkout request DTO
     */
    @Transactional
    public void checkout(CheckoutRequestDTO request) {
        log.info("Starting atomic checkout process for patient ID: {}", request.getPatientId());

        // Fetch patient's active or latest visit
        List<Visit> visits = visitRepository.findByPatientIdOrderByVisitDateDesc(request.getPatientId());
        if (visits.isEmpty()) {
            throw new IllegalArgumentException("No visits found for patient ID: " + request.getPatientId());
        }

        // Find first visit that is not yet DONE
        Visit visit = visits.stream()
                .filter(v -> v.getStatus() != VisitStatus.DONE)
                .findFirst()
                .orElse(visits.get(0)); // fallback to the latest visit if all are done

        log.info("Found visit ID: {} with status: {} for checkout", visit.getId(), visit.getStatus());

        BigDecimal totalMedicineCost = BigDecimal.ZERO;
        List<Prescription> prescriptionsToSave = new ArrayList<>();

        // Step A: Validation & Inventory
        if (request.getPrescribedItems() != null && !request.getPrescribedItems().isEmpty()) {
            for (PrescribedItemDTO item : request.getPrescribedItems()) {
                Medication medication = inventoryRepository.findById(item.getMedicineId())
                        .orElseThrow(() -> new IllegalArgumentException("Medication not found with ID: " + item.getMedicineId()));

                log.debug("Checking stock for medication: {}. Required: {}, Available: {}", 
                        medication.getName(), item.getQuantity(), medication.getAvailableStock());

                // Verify stock availability
                if (medication.getAvailableStock() < item.getQuantity()) {
                    log.error("Insufficient stock for medication: {}. Required: {}, Available: {}", 
                            medication.getName(), item.getQuantity(), medication.getAvailableStock());
                    throw new InsufficientStockException("Insufficient stock for " + medication.getName() +
                            ". Available: " + medication.getAvailableStock() + ", Requested: " + item.getQuantity());
                }

                // Deduct stock and save
                medication.setAvailableStock(medication.getAvailableStock() - item.getQuantity());
                inventoryRepository.save(medication);

                // Calculate item costs
                BigDecimal unitPrice = medication.getUnitSellingPrice() != null 
                        ? medication.getUnitSellingPrice() 
                        : BigDecimal.ZERO;
                BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                totalMedicineCost = totalMedicineCost.add(itemTotal);

                // Construct prescription record
                Prescription prescription = Prescription.builder()
                        .visit(visit)
                        .medication(medication)
                        .quantityDispensed(item.getQuantity())
                        .unitPrice(unitPrice)
                        .build();
                prescriptionsToSave.add(prescription);
            }
        }

        // Step B: Visit Record
        visit.setStatus(VisitStatus.DONE);
        if (request.getNotes() != null) {
            visit.setConsultationNotes(request.getNotes());
        }
        if (request.getConsultationFee() != null) {
            visit.setConsultationFee(request.getConsultationFee());
        }

        // Save prescriptions and updated visit
        prescriptionRepository.saveAll(prescriptionsToSave);
        visitRepository.save(visit);
        log.info("Updated visit ID: {} to status DONE. Total medicine cost: ₹{}", visit.getId(), totalMedicineCost);

        // Step C: Financial Ledger entries
        // 1. Consultation Revenue
        if (request.getConsultationFee() != null && request.getConsultationFee().compareTo(BigDecimal.ZERO) > 0) {
            LedgerTransaction consultationTx = LedgerTransaction.builder()
                    .amount(request.getConsultationFee())
                    .category("CONSULTATION")
                    .description("Consultation Revenue - Visit ID: " + visit.getId())
                    .build();
            ledgerRepository.save(consultationTx);
            log.info("Saved consultation ledger transaction of amount: ₹{}", request.getConsultationFee());
        }

        // 2. Pharmacy Revenue
        if (totalMedicineCost.compareTo(BigDecimal.ZERO) > 0) {
            LedgerTransaction pharmacyTx = LedgerTransaction.builder()
                    .amount(totalMedicineCost)
                    .category("PHARMACY_SALES")
                    .description("Pharmacy Revenue - Visit ID: " + visit.getId())
                    .build();
            ledgerRepository.save(pharmacyTx);
            log.info("Saved pharmacy ledger transaction of amount: ₹{}", totalMedicineCost);
        }

        log.info("Checkout process successfully completed for patient ID: {}", request.getPatientId());
    }
}
