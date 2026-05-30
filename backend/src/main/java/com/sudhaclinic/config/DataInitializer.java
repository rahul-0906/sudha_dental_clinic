package com.sudhaclinic.config;

import com.sudhaclinic.entity.Medication;
import com.sudhaclinic.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final MedicationRepository medicationRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (medicationRepository.count() == 0) {
                log.info("Seeding initial medication data...");

                List<Medication> medications = List.of(
                    buildMed("Amoxicillin 500mg", "MEDICINE", "Tablet", 200, 50,
                        new BigDecimal("5.00"), new BigDecimal("8.00")),
                    buildMed("Metronidazole 400mg", "MEDICINE", "Tablet", 150, 30,
                        new BigDecimal("4.00"), new BigDecimal("7.00")),
                    buildMed("Ibuprofen 400mg", "MEDICINE", "Tablet", 300, 50,
                        new BigDecimal("3.00"), new BigDecimal("6.00")),
                    buildMed("Paracetamol 500mg", "MEDICINE", "Tablet", 500, 100,
                        new BigDecimal("1.50"), new BigDecimal("3.00")),
                    buildMed("Clindamycin 300mg", "MEDICINE", "Capsule", 100, 20,
                        new BigDecimal("12.00"), new BigDecimal("18.00")),
                    buildMed("Diclofenac 50mg", "MEDICINE", "Tablet", 200, 40,
                        new BigDecimal("2.50"), new BigDecimal("5.00")),
                    buildMed("Lignocaine 2% Cartridge", "DENTAL", "Cartridge", 50, 10,
                        new BigDecimal("45.00"), new BigDecimal("80.00")),
                    buildMed("GIC (Glass Ionomer Cement)", "DENTAL", "Pack", 20, 5,
                        new BigDecimal("250.00"), new BigDecimal("400.00")),
                    buildMed("Composite Resin A2", "DENTAL", "Syringe", 15, 3,
                        new BigDecimal("400.00"), new BigDecimal("600.00")),
                    buildMed("Zinc Oxide Eugenol", "DENTAL", "Pack", 10, 3,
                        new BigDecimal("180.00"), new BigDecimal("300.00")),
                    buildMed("Dental Floss", "DENTAL", "Roll", 30, 10,
                        new BigDecimal("25.00"), new BigDecimal("50.00")),
                    buildMed("Disposable Gloves Box", "DENTAL", "Box", 10, 3,
                        new BigDecimal("180.00"), new BigDecimal("0.00")),
                    buildMed("Surgical Masks Box", "DENTAL", "Box", 5, 2,
                        new BigDecimal("150.00"), new BigDecimal("0.00")),
                    buildMed("Prophy Paste", "DENTAL", "Cup", 40, 10,
                        new BigDecimal("20.00"), new BigDecimal("40.00")),
                    buildMed("Hydrogen Peroxide 3%", "DENTAL", "Bottle", 8, 2,
                        new BigDecimal("60.00"), new BigDecimal("100.00"))
                );

                medicationRepository.saveAll(medications);
                log.info("Seeded {} medications successfully.", medications.size());
            } else {
                log.info("Medications already exist. Skipping seed data.");
            }
        };
    }

    private Medication buildMed(String name, String category, String unit,
                                 int stock, int reorder,
                                 BigDecimal costPrice, BigDecimal sellingPrice) {
        Medication m = new Medication();
        m.setName(name);
        m.setCategory(category);
        m.setUnit(unit);
        m.setCurrentStock(stock);
        m.setReorderLevel(reorder);
        m.setUnitCostPrice(costPrice);
        m.setUnitSellingPrice(sellingPrice);
        m.setActive(true);
        return m;
    }
}
