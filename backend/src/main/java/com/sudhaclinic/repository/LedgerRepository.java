package com.sudhaclinic.repository;

import com.sudhaclinic.entity.LedgerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing LedgerTransaction entities.
 */
@Repository
public interface LedgerRepository extends JpaRepository<LedgerTransaction, Long> {
}
