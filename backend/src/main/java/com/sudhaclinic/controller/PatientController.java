package com.sudhaclinic.controller;

import com.sudhaclinic.dto.PatientDTO;
import com.sudhaclinic.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /**
     * GET /api/patients?query=
     * Search patients by name or phone number.
     */
    @GetMapping
    public ResponseEntity<List<PatientDTO>> searchPatients(
            @RequestParam(required = false, defaultValue = "") String query) {
        log.debug("GET /api/patients?query={}", query);
        List<PatientDTO> results = patientService.searchPatients(query);
        return ResponseEntity.ok(results);
    }

    /**
     * POST /api/patients
     * Register a new patient.
     */
    @PostMapping
    public ResponseEntity<PatientDTO> registerPatient(@Valid @RequestBody PatientDTO dto) {
        log.info("POST /api/patients - registering: {}", dto.getName());
        PatientDTO registered = patientService.registerPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    /**
     * GET /api/patients/{id}
     * Fetch a single patient by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        log.debug("GET /api/patients/{}", id);
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }


}
