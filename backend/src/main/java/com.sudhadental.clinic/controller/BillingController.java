package com.sudhadental.clinic.controller;

import com.sudhadental.clinic.entity.CashLedger;
import com.sudhadental.clinic.entity.Invoice;
import com.sudhadental.clinic.entity.InvoiceStatus;
import com.sudhadental.clinic.entity.LedgerType;
import com.sudhadental.clinic.repository.CashLedgerRepository;
import com.sudhadental.clinic.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final InvoiceRepository invoiceRepository;
    private final CashLedgerRepository cashLedgerRepository;

    @GetMapping("/invoices")
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @GetMapping("/ledger")
    public List<CashLedger> getLedger() {
        return cashLedgerRepository.findAll();
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getCashFlowSummary() {
        List<CashLedger> entries = cashLedgerRepository.findAll();
        double totalInflow = entries.stream()
                .filter(e -> e.getType() == LedgerType.INFLOW)
                .mapToDouble(CashLedger::getAmount)
                .sum();
        double totalOutflow = entries.stream()
                .filter(e -> e.getType() == LedgerType.OUTFLOW)
                .mapToDouble(CashLedger::getAmount)
                .sum();

        return ResponseEntity.ok(Map.of(
                "totalInflow", totalInflow,
                "totalOutflow", totalOutflow,
                "netCashFlow", totalInflow - totalOutflow
        ));
    }

    @PostMapping("/ledger")
    public CashLedger addLedgerEntry(@RequestBody CashLedger entry) {
        if (entry.getDate() == null) {
            entry.setDate(LocalDateTime.now());
        }
        return cashLedgerRepository.save(entry);
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<?> payInvoice(@PathVariable Long id, @RequestBody Map<String, Double> payload) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    double payment = payload.get("amount");
                    double newPaidAmount = invoice.getPaidAmount() + payment;
                    invoice.setPaidAmount(newPaidAmount);

                    if (newPaidAmount >= invoice.getTotalAmount()) {
                        invoice.setStatus(InvoiceStatus.PAID);
                    } else {
                        invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
                    }
                    invoiceRepository.save(invoice);

                    // Add inflow entry to general ledger
                    CashLedger ledgerEntry = CashLedger.builder()
                            .type(LedgerType.INFLOW)
                            .amount(payment)
                            .description("Invoice payment received for Invoice ID: " + invoice.getId())
                            .date(LocalDateTime.now())
                            .build();
                    cashLedgerRepository.save(ledgerEntry);

                    return ResponseEntity.ok(invoice);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
