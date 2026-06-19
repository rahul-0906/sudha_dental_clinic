package com.sudhaclinic.controller;

import com.sudhaclinic.dto.DailyReportDTO;
import com.sudhaclinic.repository.*;
import com.sudhaclinic.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
public class ReportController {

    private final TransactionService transactionService;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/daily")
    public ResponseEntity<DailyReportDTO> getDailyReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate reportDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(transactionService.getDailyReport(reportDate));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        long totalPatients = patientRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalInvoices = invoiceRepository.count();
        
        // Count patient gender distributions
        long maleCount = patientRepository.findAll().stream()
                .filter(p -> "Male".equalsIgnoreCase(p.getGender()))
                .count();
        long femaleCount = patientRepository.findAll().stream()
                .filter(p -> "Female".equalsIgnoreCase(p.getGender()))
                .count();
        
        analytics.put("totalPatients", totalPatients);
        analytics.put("totalAppointments", totalAppointments);
        analytics.put("totalInvoices", totalInvoices);
        analytics.put("malePatientsCount", maleCount);
        analytics.put("femalePatientsCount", femaleCount);
        
        return ResponseEntity.ok(analytics);
    }
}
