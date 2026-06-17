package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface representing the clinic inventory.
 * Manages Medication entities as inventory items.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Medication, Long> {
}
