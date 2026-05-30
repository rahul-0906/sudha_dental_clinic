package com.sudhaclinic.controller;

import com.sudhaclinic.dto.CheckoutRequest;
import com.sudhaclinic.dto.VisitDTO;
import com.sudhaclinic.entity.VisitStatus;
import com.sudhaclinic.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    /**
     * POST /api/visits
     * Add a patient to today's queue. Body: { "patientId": 1 }
     */
    @PostMapping
    public ResponseEntity<VisitDTO> addToQueue(@RequestBody Map<String, Long> body) {
        Long patientId = body.get("patientId");
        if (patientId == null) {
            return ResponseEntity.badRequest().build();
        }
        log.info("POST /api/visits - adding patient {} to queue", patientId);
        VisitDTO visit = visitService.addToQueue(patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(visit);
    }

    /**
     * GET /api/visits/queue/today
     * Fetch today's active patient queue (all non-DONE visits for today).
     */
    @GetMapping("/queue/today")
    public ResponseEntity<List<VisitDTO>> getTodayQueue() {
        log.debug("GET /api/visits/queue/today");
        return ResponseEntity.ok(visitService.getTodayQueue());
    }

    /**
     * PATCH /api/visits/{id}/status
     * Update the status of a visit. Body: { "status": "CONSULTATION" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<VisitDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        VisitStatus status;
        try {
            status = VisitStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        log.info("PATCH /api/visits/{}/status -> {}", id, status);
        VisitDTO updated = visitService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/visits/{id}/checkout
     * Checkout: atomically saves prescriptions, deducts inventory, creates income transactions.
     */
    @PutMapping("/{id}/checkout")
    public ResponseEntity<VisitDTO> checkout(
            @PathVariable Long id,
            @Valid @RequestBody CheckoutRequest request) {
        log.info("PUT /api/visits/{}/checkout", id);
        // Ensure the visitId in the path matches the body
        request.setVisitId(id);
        VisitDTO result = visitService.checkout(request);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/visits/{id}
     * Fetch a single visit with its complete prescription list.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VisitDTO> getVisit(@PathVariable Long id) {
        log.debug("GET /api/visits/{}", id);
        VisitDTO visit = visitService.getVisitWithPrescriptions(id);
        return ResponseEntity.ok(visit);
    }

    /**
     * PATCH /api/visits/{id}/consultation
     * Save consultation notes, diagnosis, fee, prescriptions (draft — does not checkout).
     */
    @PatchMapping("/{id}/consultation")
    public ResponseEntity<VisitDTO> saveConsultation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.info("PATCH /api/visits/{}/consultation", id);
        VisitDTO result = visitService.saveConsultationNotes(id, body);
        return ResponseEntity.ok(result);
    }
}
