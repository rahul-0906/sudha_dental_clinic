package com.sudhaclinic.service;

import com.sudhaclinic.dto.DailyReportDTO;
import com.sudhaclinic.dto.TransactionDTO;
import com.sudhaclinic.entity.Prescription;
import com.sudhaclinic.entity.Transaction;
import com.sudhaclinic.entity.TransactionType;
import com.sudhaclinic.entity.Visit;
import com.sudhaclinic.entity.VisitStatus;
import com.sudhaclinic.repository.PrescriptionRepository;
import com.sudhaclinic.repository.TransactionRepository;
import com.sudhaclinic.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final VisitRepository visitRepository;
    private final PrescriptionRepository prescriptionRepository;

    /**
     * Fetch all transactions within a date range (inclusive).
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO> getAll(LocalDate start, LocalDate end) {
        log.debug("Fetching transactions from {} to {}", start, end);
        return transactionRepository.findByTransactionDateBetween(start, end)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Manually record an expense transaction (e.g. supplies, rent, utilities).
     */
    @Transactional
    public TransactionDTO addExpense(TransactionDTO dto) {
        log.info("Adding expense: {} - ₹{}", dto.getDescription(), dto.getAmount());
        Transaction transaction = Transaction.builder()
                .transactionDate(dto.getTransactionDate() != null ? dto.getTransactionDate() : LocalDate.now())
                .type(TransactionType.EXPENSE)
                .category(dto.getCategory())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .build();

        if (dto.getVisitId() != null) {
            visitRepository.findById(dto.getVisitId())
                    .ifPresent(transaction::setVisit);
        }

        Transaction saved = transactionRepository.save(transaction);
        return toDTO(saved);
    }

    /**
     * Generate the daily closing report for a given date.
     * Aggregates income, expense, patient count, and medicines dispensed.
     */
    @Transactional(readOnly = true)
    public DailyReportDTO getDailyReport(LocalDate date) {
        log.info("Generating daily report for {}", date);

        BigDecimal totalIncome = transactionRepository.sumAmountByTypeAndDate(TransactionType.INCOME, date);
        BigDecimal totalExpense = transactionRepository.sumAmountByTypeAndDate(TransactionType.EXPENSE, date);
        BigDecimal closingBalance = totalIncome.subtract(totalExpense);

        // Count distinct patients seen today (visits on this date)
        List<Visit> todayVisits = visitRepository.findByVisitDate(date);
        int patientCount = todayVisits.size();

        // Count total medicines dispensed today
        int medicinesSold = 0;
        BigDecimal consultationIncome = BigDecimal.ZERO;
        BigDecimal medicineIncome = BigDecimal.ZERO;

        List<Transaction> allTodayTransactions = transactionRepository.findByTransactionDate(date);
        for (Transaction t : allTodayTransactions) {
            if (t.getType() == TransactionType.INCOME) {
                if ("CONSULTATION".equals(t.getCategory())) {
                    consultationIncome = consultationIncome.add(t.getAmount());
                } else if ("MEDICINE_SALE".equals(t.getCategory())) {
                    medicineIncome = medicineIncome.add(t.getAmount());
                }
            }
        }

        // Sum up medicines dispensed from prescriptions linked to today's visits
        for (Visit visit : todayVisits) {
            List<Prescription> prescriptions = prescriptionRepository.findByVisitId(visit.getId());
            for (Prescription p : prescriptions) {
                medicinesSold += p.getQuantityDispensed();
            }
        }

        return DailyReportDTO.builder()
                .reportDate(date)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .closingBalance(closingBalance)
                .patientCount(patientCount)
                .medicinesSold(medicinesSold)
                .consultationIncome(consultationIncome)
                .medicineIncome(medicineIncome)
                .build();
    }

    // ===================== Mapping helpers =====================

    public TransactionDTO toDTO(Transaction t) {
        return TransactionDTO.builder()
                .id(t.getId())
                .transactionDate(t.getTransactionDate())
                .type(t.getType())
                .category(t.getCategory())
                .description(t.getDescription())
                .amount(t.getAmount())
                .visitId(t.getVisit() != null ? t.getVisit().getId() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
