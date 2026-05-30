package com.sudhaclinic.service;

import com.sudhaclinic.dto.MedicationDTO;
import com.sudhaclinic.entity.Medication;
import com.sudhaclinic.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;

    /**
     * Search active medications by name (case-insensitive partial match).
     */
    @Transactional(readOnly = true)
    public List<MedicationDTO> search(String query) {
        log.debug("Searching medications: {}", query);
        return medicationRepository
                .findByNameContainingIgnoreCaseAndIsActiveTrue(query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Return all active (non-soft-deleted) medications.
     */
    @Transactional(readOnly = true)
    public List<MedicationDTO> getAll() {
        return medicationRepository.findByIsActiveTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Save a new medication to the inventory.
     */
    @Transactional
    public MedicationDTO save(MedicationDTO dto) {
        log.info("Saving new medication: {}", dto.getName());
        Medication medication = fromDTO(dto);
        Medication saved = medicationRepository.save(medication);
        return toDTO(saved);
    }

    /**
     * Update an existing medication.
     */
    @Transactional
    public MedicationDTO update(Long id, MedicationDTO dto) {
        log.info("Updating medication ID: {}", id);
        Medication existing = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found with ID: " + id));

        existing.setName(dto.getName());
        existing.setCategory(dto.getCategory());
        existing.setUnit(dto.getUnit());
        existing.setCurrentStock(dto.getCurrentStock());
        existing.setReorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : 10);
        existing.setUnitCostPrice(dto.getUnitCostPrice());
        existing.setUnitSellingPrice(dto.getUnitSellingPrice());
        existing.setActive(dto.isActive());

        Medication saved = medicationRepository.save(existing);
        return toDTO(saved);
    }

    /**
     * Deduct stock when medicines are dispensed. Throws if stock is insufficient.
     */
    @Transactional
    public void deductStock(Long medicationId, int quantity) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found with ID: " + medicationId));

        if (medication.getCurrentStock() < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for " + medication.getName() +
                    ". Available: " + medication.getCurrentStock() + ", Requested: " + quantity);
        }

        medication.setCurrentStock(medication.getCurrentStock() - quantity);
        medicationRepository.save(medication);
        log.info("Deducted {} units from {}. New stock: {}", quantity, medication.getName(), medication.getCurrentStock());
    }

    /**
     * Returns medications where currentStock is at or below the reorder level.
     */
    @Transactional(readOnly = true)
    public List<MedicationDTO> getLowStockAlerts() {
        return medicationRepository.findByIsActiveTrue()
                .stream()
                .filter(m -> m.getCurrentStock() <= m.getReorderLevel())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ===================== Mapping helpers =====================

    public MedicationDTO toDTO(Medication m) {
        return MedicationDTO.builder()
                .id(m.getId())
                .name(m.getName())
                .category(m.getCategory())
                .unit(m.getUnit())
                .currentStock(m.getCurrentStock())
                .reorderLevel(m.getReorderLevel())
                .unitCostPrice(m.getUnitCostPrice())
                .unitSellingPrice(m.getUnitSellingPrice())
                .isActive(m.isActive())
                .lowStock(m.getCurrentStock() <= m.getReorderLevel())
                .build();
    }

    private Medication fromDTO(MedicationDTO dto) {
        return Medication.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .unit(dto.getUnit())
                .currentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : 0)
                .reorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : 10)
                .unitCostPrice(dto.getUnitCostPrice())
                .unitSellingPrice(dto.getUnitSellingPrice())
                .isActive(dto.isActive())
                .build();
    }
}
