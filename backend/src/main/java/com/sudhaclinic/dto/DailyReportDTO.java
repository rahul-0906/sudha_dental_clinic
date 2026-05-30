package com.sudhaclinic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for the daily closing report.
 * Aggregates income, expense, patient count, medicines sold, and closing balance for a given date.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportDTO {

    private LocalDate reportDate;

    /** Total income for the day (consultation fees + medicine sales) */
    private BigDecimal totalIncome;

    /** Total expenses recorded for the day */
    private BigDecimal totalExpense;

    /** Net closing balance = totalIncome - totalExpense */
    private BigDecimal closingBalance;

    /** Number of unique patients seen today */
    private int patientCount;

    /** Total number of medication units dispensed today */
    private int medicinesSold;

    /** Total income from consultation fees only */
    private BigDecimal consultationIncome;

    /** Total income from medicine sales only */
    private BigDecimal medicineIncome;
}
