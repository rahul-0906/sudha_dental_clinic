package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {

    /**
     * Search active medications by name (case-insensitive partial match).
     */
    List<Medication> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    /**
     * Returns all active medications (not soft-deleted).
     */
    List<Medication> findByIsActiveTrue();
}
