package com.sudhadental.clinic.service;

import com.sudhadental.clinic.dto.PrescriptionDto;
import com.sudhadental.clinic.dto.TreatmentRequestDto;
import com.sudhadental.clinic.entity.*;
import com.sudhadental.clinic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreatmentService {

    private final TreatmentRecordRepository treatmentRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final InventoryRepository inventoryRepository;
    private final CashLedgerRepository cashLedgerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public TreatmentRecord recordTreatment(TreatmentRequestDto request) {
        log.info("Recording new treatment for patient ID: {}", request.getPatientId());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + request.getPatientId()));

        User dentist = userRepository.findById(request.getDentistId())
                .orElseThrow(() -> new IllegalArgumentException("Dentist not found with ID: " + request.getDentistId()));

        // 1. Save Treatment Record
        TreatmentRecord record = TreatmentRecord.builder()
                .patient(patient)
                .dentist(dentist)
                .chiefComplaint(request.getChiefComplaint())
                .diagnosis(request.getDiagnosis())
                .procedureCompleted(request.getProcedureCompleted())
                .cost(request.getCost())
                .date(LocalDateTime.now())
                .build();

        record = treatmentRecordRepository.save(record);
        log.info("TreatmentRecord saved with ID: {}", record.getId());

        // 2. Save Prescriptions if any
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            for (PrescriptionDto pDto : request.getPrescriptions()) {
                Prescription prescription = Prescription.builder()
                        .treatmentRecord(record)
                        .medicineName(pDto.getMedicineName())
                        .dosage(pDto.getDosage())
                        .duration(pDto.getDuration())
                        .instructions(pDto.getInstructions())
                        .build();
                prescriptionRepository.save(prescription);
            }
            log.info("Saved {} prescriptions linked to treatment record ID: {}", request.getPrescriptions().size(), record.getId());
        }

        // 3. Auto-Deduct Inventory Materials based on Procedure type
        deductMaterialsForProcedure(request.getProcedureCompleted());

        // 4. Create Invoice
        InvoiceStatus invoiceStatus = InvoiceStatus.UNPAID;
        double paid = request.getPaidAmount() != null ? request.getPaidAmount() : 0.0;
        if (paid >= request.getCost()) {
            invoiceStatus = InvoiceStatus.PAID;
        } else if (paid > 0.0) {
            invoiceStatus = InvoiceStatus.PARTIALLY_PAID;
        }

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .totalAmount(request.getCost())
                .paidAmount(paid)
                .status(invoiceStatus)
                .billingDate(LocalDateTime.now())
                .build();
        invoiceRepository.save(invoice);
        log.info("Invoice generated and saved. Total: {}, Paid: {}, Status: {}", request.getCost(), paid, invoiceStatus);

        // 5. Update Cash Ledger if payment is received
        if (paid > 0.0) {
            CashLedger ledgerEntry = CashLedger.builder()
                    .type(LedgerType.INFLOW)
                    .amount(paid)
                    .description("Payment received for treatment record ID: " + record.getId() + " (" + request.getProcedureCompleted() + ")")
                    .date(LocalDateTime.now())
                    .build();
            cashLedgerRepository.save(ledgerEntry);
            log.info("Cash ledger updated with Inflow: {}", paid);
        }

        return record;
    }

    private void deductMaterialsForProcedure(String procedure) {
        if (procedure == null) return;
        
        String cleanProc = procedure.trim().toLowerCase();
        log.info("Executing auto-deduction of inventory for procedure: {}", procedure);

        switch (cleanProc) {
            case "filling":
                deductStock("Composite Resin", 1);
                deductStock("Syringe Needle", 1);
                break;
            case "root canal":
                deductStock("Gutta Percha Points", 2);
                deductStock("Dental Anesthetic", 1);
                break;
            case "extraction":
                deductStock("Dental Anesthetic", 1);
                deductStock("Suture Thread", 2);
                break;
            case "teeth cleaning":
            case "cleaning":
                deductStock("Prophy Paste", 1);
                deductStock("Saliva Ejector", 1);
                break;
            default:
                log.info("No standard inventory deduction rules defined for procedure: {}. Skipping auto-deduction.", procedure);
                break;
        }
    }

    private void deductStock(String materialName, int amount) {
        Optional<Inventory> optionalInventory = inventoryRepository.findByMaterialNameIgnoreCase(materialName);
        if (optionalInventory.isPresent()) {
            Inventory item = optionalInventory.get();
            int currentQty = item.getQuantity();
            int newQty = Math.max(0, currentQty - amount);
            item.setQuantity(newQty);
            inventoryRepository.save(item);
            
            log.info("Deducted {} {} of {}. Previous stock: {}, New stock: {}", 
                     amount, item.getUnit(), item.getMaterialName(), currentQty, newQty);
            
            if (newQty < item.getLowStockThreshold()) {
                log.warn("WARNING: Stock level of '{}' has fallen below the threshold ({} < {}). Alert triggered.", 
                         item.getMaterialName(), newQty, item.getLowStockThreshold());
            }
        } else {
            log.warn("Material '{}' was not found in inventory. Cannot auto-deduct stock.", materialName);
        }
    }
}
