package com.sudhadental.clinic.controller;

import com.sudhadental.clinic.entity.Appointment;
import com.sudhadental.clinic.entity.AppointmentStatus;
import com.sudhadental.clinic.entity.Patient;
import com.sudhadental.clinic.entity.User;
import com.sudhadental.clinic.repository.AppointmentRepository;
import com.sudhadental.clinic.repository.PatientRepository;
import com.sudhadental.clinic.repository.UserRepository;
import com.sudhadental.clinic.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final WhatsAppService whatsAppService;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/today")
    public List<Appointment> getTodayAppointments() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return appointmentRepository.findByAppointmentTimeBetween(start, end);
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> payload) {
        try {
            Long patientId = Long.valueOf(payload.get("patientId").toString());
            Long dentistId = Long.valueOf(payload.get("dentistId").toString());
            LocalDateTime appTime = LocalDateTime.parse(payload.get("appointmentTime").toString());
            String complaint = payload.get("chiefComplaint") != null ? payload.get("chiefComplaint").toString() : "";

            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
            User dentist = userRepository.findById(dentistId)
                    .orElseThrow(() -> new IllegalArgumentException("Dentist not found"));

            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .dentist(dentist)
                    .appointmentTime(appTime)
                    .status(AppointmentStatus.PENDING)
                    .chiefComplaint(complaint)
                    .whatsappReminderSent(false)
                    .build();

            return ResponseEntity.ok(appointmentRepository.save(appointment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return appointmentRepository.findById(id)
                .map(app -> {
                    app.setStatus(AppointmentStatus.valueOf(payload.get("status")));
                    return ResponseEntity.ok(appointmentRepository.save(app));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/send-reminder")
    public ResponseEntity<?> triggerWhatsAppReminder(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(app -> {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
                    String timeStr = app.getAppointmentTime().format(formatter);
                    boolean sent = whatsAppService.sendAppointmentReminder(
                            app.getPatient().getPhone(),
                            app.getPatient().getName(),
                            timeStr,
                            app.getDentist().getFullName()
                    );
                    if (sent) {
                        app.setWhatsappReminderSent(true);
                        appointmentRepository.save(app);
                        return ResponseEntity.ok(Map.of("message", "WhatsApp reminder sent successfully"));
                    } else {
                        return ResponseEntity.internalServerError().body(Map.of("message", "Failed to send WhatsApp reminder"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
