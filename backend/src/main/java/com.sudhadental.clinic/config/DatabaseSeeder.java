package com.sudhadental.clinic.config;

import com.sudhadental.clinic.entity.*;
import com.sudhadental.clinic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final InventoryRepository inventoryRepository;
    private final AppointmentRepository appointmentRepository;
    private final CashLedgerRepository cashLedgerRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("DatabaseSeeder starting...");

        // 1. Seed Users if table is empty
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password("password")
                    .fullName("Dr. Sudha (Owner)")
                    .role(Role.ADMIN)
                    .build();

            User dentist = User.builder()
                    .username("dentist")
                    .password("password")
                    .fullName("Dr. Sarah Jenkins")
                    .role(Role.DENTIST)
                    .build();

            User receptionist = User.builder()
                    .username("receptionist")
                    .password("password")
                    .fullName("Emily Watson")
                    .role(Role.RECEPTIONIST)
                    .build();

            userRepository.saveAll(Arrays.asList(admin, dentist, receptionist));
            log.info("Seeded initial clinic users: admin, dentist, receptionist.");
        }

        // 2. Seed Inventory if empty
        if (inventoryRepository.count() == 0) {
            List<Inventory> materials = Arrays.asList(
                    Inventory.builder().materialName("Composite Resin").quantity(15).lowStockThreshold(5).unit("tubes").build(),
                    Inventory.builder().materialName("Dental Anesthetic").quantity(8).lowStockThreshold(10).unit("cartridges").build(), // low stock
                    Inventory.builder().materialName("Syringe Needle").quantity(45).lowStockThreshold(15).unit("pcs").build(),
                    Inventory.builder().materialName("Gutta Percha Points").quantity(30).lowStockThreshold(10).unit("pcs").build(),
                    Inventory.builder().materialName("Suture Thread").quantity(4).lowStockThreshold(5).unit("pcs").build(), // low stock
                    Inventory.builder().materialName("Prophy Paste").quantity(12).lowStockThreshold(4).unit("tubes").build(),
                    Inventory.builder().materialName("Saliva Ejector").quantity(50).lowStockThreshold(15).unit("pcs").build()
            );
            inventoryRepository.saveAll(materials);
            log.info("Seeded initial inventory stock items.");
        }

        // 3. Seed Patients if empty
        if (patientRepository.count() == 0) {
            Patient p1 = Patient.builder().name("John Doe").phone("9876543210").email("john.doe@example.com").age(35).gender("Male").medicalHistory("Hypertension").build();
            Patient p2 = Patient.builder().name("Jane Smith").phone("9876543211").email("jane.smith@example.com").age(28).gender("Female").medicalHistory("None").build();
            Patient p3 = Patient.builder().name("Alice Johnson").phone("9876543212").email("alice.j@example.com").age(42).gender("Female").medicalHistory("Penicillin Allergy").build();
            patientRepository.saveAll(Arrays.asList(p1, p2, p3));
            log.info("Seeded initial mock patient profiles.");

            // Seed Appointments
            List<User> dentists = userRepository.findByRole(Role.DENTIST);
            if (!dentists.isEmpty()) {
                User doc = dentists.get(0);
                
                // Today's appointments
                Appointment a1 = Appointment.builder()
                        .patient(p1)
                        .dentist(doc)
                        .appointmentTime(LocalDateTime.now().withHour(10).withMinute(0))
                        .status(AppointmentStatus.CONFIRMED)
                        .chiefComplaint("Toothache in upper molar")
                        .whatsappReminderSent(true)
                        .build();

                Appointment a2 = Appointment.builder()
                        .patient(p2)
                        .dentist(doc)
                        .appointmentTime(LocalDateTime.now().withHour(14).withMinute(30))
                        .status(AppointmentStatus.PENDING)
                        .chiefComplaint("Routine dental cleanup")
                        .whatsappReminderSent(false)
                        .build();

                // Tomorrow's appointment
                Appointment a3 = Appointment.builder()
                        .patient(p3)
                        .dentist(doc)
                        .appointmentTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0))
                        .status(AppointmentStatus.PENDING)
                        .chiefComplaint("Root canal follow-up")
                        .whatsappReminderSent(false)
                        .build();

                appointmentRepository.saveAll(Arrays.asList(a1, a2, a3));
                log.info("Seeded initial mock appointments for testing.");
            }
            
            // Seed a ledger history entry
            CashLedger led1 = CashLedger.builder().type(LedgerType.OUTFLOW).amount(250.0).description("Office supplies & cleaning kits purchase").date(LocalDateTime.now().minusDays(1)).build();
            CashLedger led2 = CashLedger.builder().type(LedgerType.INFLOW).amount(500.0).description("Opening balance / Consultation fees").date(LocalDateTime.now().minusDays(1)).build();
            cashLedgerRepository.saveAll(Arrays.asList(led1, led2));
            log.info("Seeded initial ledger inflow/outflow entries.");
        }

        log.info("DatabaseSeeder execution finished successfully.");
    }
}
