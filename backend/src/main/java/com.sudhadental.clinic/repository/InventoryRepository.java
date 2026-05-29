package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByMaterialNameIgnoreCase(String materialName);
    
    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.lowStockThreshold")
    List<Inventory> findLowStockItems();
}
