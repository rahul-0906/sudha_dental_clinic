package com.sudhaclinic.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
public class AuthController {

    @Value("${clinic.pin:1234}")
    private String clinicPin;

    @PostMapping("/verify-pin")
    public ResponseEntity<Map<String, Object>> verifyPin(@RequestBody Map<String, String> body) {
        String providedPin = body.get("pin");
        boolean valid = clinicPin.equals(providedPin);
        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "sessionDate", LocalDate.now().toString(),
                "message", valid ? "Access granted" : "Incorrect PIN"
        ));
    }

    @GetMapping("/clinic-info")
    public ResponseEntity<Map<String, String>> getClinicInfo() {
        return ResponseEntity.ok(Map.of(
                "name", "Sudha Dental Clinic",
                "location", "Sankarankovil",
                "doctor", "Dr. Mariyappan",
                "tagline", "Your smile is our priority"
        ));
    }
}
