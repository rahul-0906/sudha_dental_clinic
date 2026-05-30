package com.sudhaclinic.controller;

import com.sudhaclinic.dto.TransactionDTO;
import com.sudhaclinic.service.TransactionService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * GET /api/transactions?startDate=2024-01-01&endDate=2024-01-31
     * List all transactions within the given date range.
     * Defaults to today if no dates provided.
     */
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now();
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        log.debug("GET /api/transactions?startDate={}&endDate={}", start, end);
        return ResponseEntity.ok(transactionService.getAll(start, end));
    }

    /**
     * POST /api/transactions
     * Manually add an expense transaction (e.g., rent, supplies).
     */
    @PostMapping
    public ResponseEntity<TransactionDTO> addExpense(@Valid @RequestBody TransactionDTO dto) {
        log.info("POST /api/transactions - expense: {}", dto.getDescription());
        TransactionDTO saved = transactionService.addExpense(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
