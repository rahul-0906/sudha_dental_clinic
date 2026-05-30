package com.sudhaclinic.controller;

import com.sudhaclinic.dto.DailyReportDTO;
import com.sudhaclinic.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
public class ReportController {

    private final TransactionService transactionService;

    @GetMapping("/daily")
    public ResponseEntity<DailyReportDTO> getDailyReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate reportDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(transactionService.getDailyReport(reportDate));
    }
}
