package com.sudhaclinic.service;

import com.sudhaclinic.dto.PatientDTO;
import com.sudhaclinic.dto.PrescriptionDTO;
import com.sudhaclinic.dto.VisitDTO;
import com.sudhaclinic.entity.Patient;
import com.sudhaclinic.entity.Prescription;
import com.sudhaclinic.entity.Visit;
import com.sudhaclinic.repository.PatientRepository;
import com.sudhaclinic.repository.PrescriptionRepository;
import com.sudhaclinic.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final PrescriptionRepository prescriptionRepository;

    /**
     * Search patients by name or phone number (case-insensitive partial match).
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> searchPatients(String query) {
        log.debug("Searching patients with query: {}", query);
        return patientRepository
                .findByPhoneContainingIgnoreCaseOrNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Register a new patient. Throws if phone already exists.
     */
    @Transactional
    public PatientDTO registerPatient(PatientDTO dto) {
        log.info("Registering new patient: {} - {}", dto.getName(), dto.getPhone());

        if (patientRepository.findByPhone(dto.getPhone()).isPresent()) {
            throw new IllegalArgumentException("A patient with phone number " + dto.getPhone() + " already exists.");
        }

        Patient patient = Patient.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .build();

        Patient saved = patientRepository.save(patient);
        log.info("Patient registered with ID: {}", saved.getId());
        return toDTO(saved);
    }

    /**
     * Fetch a patient by ID. Throws if not found.
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + id));
        return toDTO(patient);
    }

    /**
     * Fetch the complete visit history for a patient, including prescriptions for each visit.
     */
    @Transactional(readOnly = true)
    public List<VisitDTO> getVisitHistory(Long patientId) {
        log.debug("Fetching visit history for patient ID: {}", patientId);

        // Ensure patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        List<Visit> visits = visitRepository.findByPatientIdOrderByVisitDateDesc(patientId);

        return visits.stream()
                .map(visit -> {
                    List<Prescription> prescriptions = prescriptionRepository.findByVisitId(visit.getId());
                    return toVisitDTO(visit, prescriptions);
                })
                .collect(Collectors.toList());
    }

    // ===================== Mapping helpers =====================

    public PatientDTO toDTO(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .name(patient.getName())
                .phone(patient.getPhone())
                .dob(patient.getDob())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .createdAt(patient.getCreatedAt())
                .build();
    }

    private VisitDTO toVisitDTO(Visit visit, List<Prescription> prescriptions) {
        List<PrescriptionDTO> prescriptionDTOs = prescriptions.stream()
                .map(this::toPrescriptionDTO)
                .collect(Collectors.toList());

        return VisitDTO.builder()
                .id(visit.getId())
                .patientId(visit.getPatient().getId())
                .patientName(visit.getPatient().getName())
                .patientPhone(visit.getPatient().getPhone())
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
        BigDecimal lineTotal = p.getUnitPrice().multiply(
                BigDecimal.valueOf(p.getQuantityDispensed()));
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
