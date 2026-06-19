package com.sudhaclinic.controller;

import com.sudhaclinic.entity.ClinicSettings;
import com.sudhaclinic.service.ClinicSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"}, allowCredentials = "true")
@RequiredArgsConstructor
public class ClinicSettingsController {

    private final ClinicSettingsService clinicSettingsService;

    @GetMapping
    public ResponseEntity<ClinicSettings> getSettings() {
        log.debug("GET /api/settings");
        return ResponseEntity.ok(clinicSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody ClinicSettings settings) {
        log.info("PUT /api/settings - Updating settings");
        try {
            ClinicSettings updated = clinicSettingsService.updateSettings(settings);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update settings", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
