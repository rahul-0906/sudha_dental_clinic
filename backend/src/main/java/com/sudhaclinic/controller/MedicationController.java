package com.sudhaclinic.controller;

import com.sudhaclinic.dto.MedicationDTO;
import com.sudhaclinic.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    /**
     * GET /api/medications?query=
     * Search active medications by name. Falls back to getAll() if no query.
     */
    @GetMapping
    public ResponseEntity<List<MedicationDTO>> getMedications(
            @RequestParam(required = false) String query) {
        log.debug("GET /api/medications?query={}", query);
        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(medicationService.search(query));
        }
        return ResponseEntity.ok(medicationService.getAll());
    }

    /**
     * GET /api/medications/low-stock
     * Returns medications at or below reorder level.
     * NOTE: This must be declared BEFORE /{id} to avoid path ambiguity.
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicationDTO>> getLowStockAlerts() {
        log.debug("GET /api/medications/low-stock");
        return ResponseEntity.ok(medicationService.getLowStockAlerts());
    }

    /**
     * POST /api/medications
     * Add a new medication to the inventory.
     */
    @PostMapping
    public ResponseEntity<MedicationDTO> addMedication(@Valid @RequestBody MedicationDTO dto) {
        log.info("POST /api/medications - adding: {}", dto.getName());
        MedicationDTO saved = medicationService.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/medications/{id}
     * Update an existing medication.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MedicationDTO> updateMedication(
            @PathVariable Long id,
            @Valid @RequestBody MedicationDTO dto) {
        log.info("PUT /api/medications/{}", id);
        MedicationDTO updated = medicationService.update(id, dto);
        return ResponseEntity.ok(updated);
    }
}
