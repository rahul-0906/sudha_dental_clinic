package com.sudhaclinic.controller;

import com.sudhaclinic.entity.Appointment;
import com.sudhaclinic.service.AppointmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long patientId) {
        log.debug("GET /api/appointments - date: {}, patientId: {}", date, patientId);
        if (date != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
        } else if (patientId != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
        } else {
            return ResponseEntity.ok(appointmentService.getAllAppointments());
        }
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        log.info("POST /api/appointments - request: {}", request);
        try {
            Appointment created = appointmentService.createAppointment(
                    request.getPatientId(),
                    request.getDoctor(),
                    request.getAppointmentDate(),
                    request.getAppointmentTime(),
                    request.getTreatment(),
                    request.getStatus(),
                    request.getLocation()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating appointment", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdate update) {
        log.info("PATCH /api/appointments/{}/status - status: {}", id, update.getStatus());
        try {
            Appointment updated = appointmentService.updateStatus(id, update.getStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating appointment status", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class AppointmentRequest {
        private Long patientId;
        private String doctor;
        private LocalDate appointmentDate;
        private String appointmentTime;
        private String treatment;
        private String status;
        private String location;
    }

    @Data
    public static class StatusUpdate {
        private String status;
    }
}
