package com.sudhadental.clinic.controller;

import com.sudhadental.clinic.dto.TreatmentRequestDto;
import com.sudhadental.clinic.entity.TreatmentRecord;
import com.sudhadental.clinic.repository.TreatmentRecordRepository;
import com.sudhadental.clinic.service.TreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;
    private final TreatmentRecordRepository treatmentRecordRepository;

    @GetMapping
    public List<TreatmentRecord> getAllTreatments() {
        return treatmentRecordRepository.findAll();
    }

    @GetMapping("/patient/{patientId}")
    public List<TreatmentRecord> getTreatmentsByPatient(@PathVariable Long patientId) {
        return treatmentRecordRepository.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<?> recordTreatment(@RequestBody TreatmentRequestDto request) {
        try {
            TreatmentRecord record = treatmentService.recordTreatment(request);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
