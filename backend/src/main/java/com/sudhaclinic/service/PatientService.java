package com.sudhaclinic.service;

import com.sudhaclinic.dto.PatientDTO;
import com.sudhaclinic.entity.Patient;
import com.sudhaclinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;


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


}
