package com.sudhadental.clinic.controller;

import com.sudhadental.clinic.entity.Inventory;
import com.sudhadental.clinic.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    @GetMapping("/alerts")
    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findLowStockItems();
    }

    @PostMapping
    public Inventory addMaterial(@RequestBody Inventory material) {
        return inventoryRepository.save(material);
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStockQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    int addQty = payload.get("quantity");
                    item.setQuantity(item.getQuantity() + addQty);
                    return ResponseEntity.ok(inventoryRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateThresholdAndDetails(@PathVariable Long id, @RequestBody Inventory details) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    item.setMaterialName(details.getMaterialName());
                    item.setQuantity(details.getQuantity());
                    item.setLowStockThreshold(details.getLowStockThreshold());
                    item.setUnit(details.getUnit());
                    return ResponseEntity.ok(inventoryRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
