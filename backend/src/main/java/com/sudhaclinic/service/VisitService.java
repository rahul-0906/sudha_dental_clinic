package com.sudhaclinic.service;

import com.sudhaclinic.dto.CheckoutRequest;
import com.sudhaclinic.dto.PrescriptionDTO;
import com.sudhaclinic.dto.VisitDTO;
import com.sudhaclinic.entity.*;
import com.sudhaclinic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final MedicationRepository medicationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Add a patient to today's queue. Creates a Visit with WAITING status.
     */
    @Transactional
    public VisitDTO addToQueue(Long patientId) {
        log.info("Adding patient {} to today's queue", patientId);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        Visit visit = Visit.builder()
                .patient(patient)
                .status(VisitStatus.WAITING)
                .build();

        Visit saved = visitRepository.save(visit);
        log.info("Created visit {} for patient {} ({})", saved.getId(), patient.getName(), patient.getPhone());
        return toDTO(saved, List.of());
    }

    /**
     * Fetch all visits for today that are NOT in DONE status (active queue).
     */
    @Transactional(readOnly = true)
    public List<VisitDTO> getTodayQueue() {
        log.debug("Fetching today's active queue");
        List<Visit> visits = visitRepository.findByVisitDateAndStatusNot(LocalDate.now(), VisitStatus.DONE);
        return visits.stream()
                .map(v -> toDTO(v, List.of()))
                .collect(Collectors.toList());
    }

    /**
     * Update the status of a visit (WAITING → CONSULTATION → CHECKOUT → DONE).
     */
    @Transactional
    public VisitDTO updateStatus(Long visitId, VisitStatus status) {
        log.info("Updating visit {} status to {}", visitId, status);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found with ID: " + visitId));
        visit.setStatus(status);
        Visit saved = visitRepository.save(visit);
        List<Prescription> prescriptions = prescriptionRepository.findByVisitId(visitId);
        return toDTO(saved, prescriptions);
    }

    /**
     * Atomic checkout: saves prescriptions, deducts inventory, creates income transactions,
     * updates visit status to DONE.
     */
    @Transactional
    public VisitDTO checkout(CheckoutRequest request) {
        log.info("Processing checkout for visit {}", request.getVisitId());

        Visit visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new IllegalArgumentException("Visit not found with ID: " + request.getVisitId()));

        // Update consultation fields
        if (request.getConsultationFee() != null) {
            visit.setConsultationFee(request.getConsultationFee());
        }
        if (request.getConsultationNotes() != null) {
            visit.setConsultationNotes(request.getConsultationNotes());
        }
        if (request.getDiagnosis() != null) {
            visit.setDiagnosis(request.getDiagnosis());
        }
        if (request.getNextVisitDate() != null) {
            visit.setNextVisitDate(request.getNextVisitDate());
        }
        visit.setStatus(VisitStatus.DONE);

        List<Prescription> savedPrescriptions = new ArrayList<>();

        // Process each prescription item
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            for (CheckoutRequest.PrescriptionItem item : request.getPrescriptions()) {
                Medication medication = medicationRepository.findById(item.getMedicationId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Medication not found with ID: " + item.getMedicationId()));

                // Validate stock
                if (medication.getCurrentStock() < item.getQuantity()) {
                    throw new IllegalStateException(
                            "Insufficient stock for " + medication.getName() +
                            ". Available: " + medication.getCurrentStock() +
                            ", Requested: " + item.getQuantity());
                }

                // Deduct stock
                medication.setCurrentStock(medication.getCurrentStock() - item.getQuantity());
                medicationRepository.save(medication);

                // Capture unit price at time of dispensing
                BigDecimal unitPrice = medication.getUnitSellingPrice() != null
                        ? medication.getUnitSellingPrice()
                        : BigDecimal.ZERO;

                // Create prescription record
                Prescription prescription = Prescription.builder()
                        .visit(visit)
                        .medication(medication)
                        .quantityDispensed(item.getQuantity())
                        .unitPrice(unitPrice)
                        .build();
                savedPrescriptions.add(prescriptionRepository.save(prescription));

                // Create income transaction for medicine sale (only if selling price > 0)
                if (unitPrice.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal medicineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                    Transaction medicineIncome = Transaction.builder()
                            .type(TransactionType.INCOME)
                            .category("MEDICINE_SALE")
                            .description("Medicine: " + medication.getName() + " x" + item.getQuantity())
                            .amount(medicineTotal)
                            .visit(visit)
                            .build();
                    transactionRepository.save(medicineIncome);
                    log.debug("Created medicine income transaction: {} x{} = ₹{}", medication.getName(), item.getQuantity(), medicineTotal);
                }
            }
        }

        // Create income transaction for consultation fee
        if (request.getConsultationFee() != null && request.getConsultationFee().compareTo(BigDecimal.ZERO) > 0) {
            Transaction consultationIncome = Transaction.builder()
                    .type(TransactionType.INCOME)
                    .category("CONSULTATION")
                    .description("Consultation fee - " + visit.getPatient().getName())
                    .amount(request.getConsultationFee())
                    .visit(visit)
                    .build();
            transactionRepository.save(consultationIncome);
            log.debug("Created consultation income transaction: ₹{}", request.getConsultationFee());
        }

        Visit saved = visitRepository.save(visit);
        log.info("Checkout complete for visit {}. Patient: {}", saved.getId(), saved.getPatient().getName());
        return toDTO(saved, savedPrescriptions);
    }

    /**
     * Fetch a single visit with its complete prescription list.
     */
    @Transactional(readOnly = true)
    public VisitDTO getVisitWithPrescriptions(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found with ID: " + visitId));
        List<Prescription> prescriptions = prescriptionRepository.findByVisitId(visitId);
        return toDTO(visit, prescriptions);
    }

    /**
     * Save consultation notes as a draft (does not complete checkout or deduct inventory).
     * Used by the ConsultationForm 'Save Draft' action.
     */
    @Transactional
    public VisitDTO saveConsultationNotes(Long visitId, java.util.Map<String, Object> body) {
        log.info("Saving consultation notes for visit {}", visitId);
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found with ID: " + visitId));

        if (body.containsKey("symptoms")) visit.setSymptoms((String) body.get("symptoms"));
        if (body.containsKey("consultationNotes")) visit.setConsultationNotes((String) body.get("consultationNotes"));
        if (body.containsKey("diagnosis")) visit.setDiagnosis((String) body.get("diagnosis"));
        if (body.containsKey("consultationFee") && body.get("consultationFee") != null) {
            visit.setConsultationFee(new BigDecimal(body.get("consultationFee").toString()));
        }
        if (body.containsKey("nextVisitDate") && body.get("nextVisitDate") != null) {
            visit.setNextVisitDate(LocalDate.parse(body.get("nextVisitDate").toString()));
        }

        Visit saved = visitRepository.save(visit);
        List<Prescription> prescriptions = prescriptionRepository.findByVisitId(visitId);
        return toDTO(saved, prescriptions);
    }

    // ===================== Mapping helpers =====================

    private VisitDTO toDTO(Visit visit, List<Prescription> prescriptions) {
        List<PrescriptionDTO> prescriptionDTOs = prescriptions.stream()
                .map(this::toPrescriptionDTO)
                .collect(Collectors.toList());

        Patient pat = visit.getPatient();
        VisitDTO.PatientSummary patientSummary = VisitDTO.PatientSummary.builder()
                .id(pat.getId())
                .name(pat.getName())
                .phone(pat.getPhone())
                .gender(pat.getGender())
                .dob(pat.getDob() != null ? pat.getDob().toString() : null)
                .build();

        return VisitDTO.builder()
                .id(visit.getId())
                .patientId(pat.getId())
                .patientName(pat.getName())
                .patientPhone(pat.getPhone())
                .patient(patientSummary)
                .visitDate(visit.getVisitDate())
                .symptoms(visit.getSymptoms())
                .consultationNotes(visit.getConsultationNotes())
                .diagnosis(visit.getDiagnosis())
                .consultationFee(visit.getConsultationFee())
                .nextVisitDate(visit.getNextVisitDate())
                .status(visit.getStatus())
                .createdAt(visit.getCreatedAt())
                .prescriptions(prescriptionDTOs)
                .build();
    }

    private PrescriptionDTO toPrescriptionDTO(Prescription p) {
        BigDecimal lineTotal = p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantityDispensed()));
        return PrescriptionDTO.builder()
                .id(p.getId())
                .medicationId(p.getMedication().getId())
                .medicationName(p.getMedication().getName())
                .unit(p.getMedication().getUnit())
                .quantityDispensed(p.getQuantityDispensed())
                .unitPrice(p.getUnitPrice())
                .lineTotal(lineTotal)
                .build();
    }
}
