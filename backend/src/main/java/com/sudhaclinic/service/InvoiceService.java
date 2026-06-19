package com.sudhaclinic.service;

import com.sudhaclinic.entity.Invoice;
import com.sudhaclinic.entity.Patient;
import com.sudhaclinic.repository.InvoiceRepository;
import com.sudhaclinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        log.debug("Fetching all invoices");
        return invoiceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByPatient(Long patientId) {
        log.debug("Fetching invoices for patient ID: {}", patientId);
        return invoiceRepository.findByPatientId(patientId);
    }

    @Transactional
    public Invoice createInvoice(Long patientId, String invoiceNumber, BigDecimal amount, BigDecimal paidAmount, String status) {
        log.info("Creating invoice for patient ID: {} with amount: {}", patientId, amount);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        String invNum = invoiceNumber;
        if (invNum == null || invNum.trim().isEmpty()) {
            invNum = "INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .invoiceNumber(invNum)
                .invoiceDate(LocalDate.now())
                .amount(amount)
                .paidAmount(paidAmount)
                .status(status != null ? status : "PENDING")
                .build();

        return invoiceRepository.save(invoice);
    }
}
