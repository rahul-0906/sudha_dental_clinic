package com.sudhaclinic.controller;

import com.sudhaclinic.entity.Invoice;
import com.sudhaclinic.service.InvoiceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        log.debug("GET /api/invoices");
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Invoice>> getInvoicesByPatient(@PathVariable Long patientId) {
        log.debug("GET /api/invoices/patient/{}", patientId);
        return ResponseEntity.ok(invoiceService.getInvoicesByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequest request) {
        log.info("POST /api/invoices - request: {}", request);
        try {
            Invoice created = invoiceService.createInvoice(
                    request.getPatientId(),
                    request.getInvoiceNumber(),
                    request.getAmount(),
                    request.getPaidAmount(),
                    request.getStatus()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating invoice", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class InvoiceRequest {
        private Long patientId;
        private String invoiceNumber;
        private BigDecimal amount;
        private BigDecimal paidAmount;
        private String status;
    }
}
