package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Transaction;
import com.sudhaclinic.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Returns all transactions on a given date.
     */
    List<Transaction> findByTransactionDate(LocalDate date);

    /**
     * Returns all transactions within a date range (inclusive).
     */
    List<Transaction> findByTransactionDateBetween(LocalDate start, LocalDate end);

    /**
     * Sums the total amount for a given transaction type on a specific date.
     * Returns 0 (BigDecimal.ZERO coalesced) when no records exist.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.transactionDate = :date")
    BigDecimal sumAmountByTypeAndDate(@Param("type") TransactionType type, @Param("date") LocalDate date);
}
