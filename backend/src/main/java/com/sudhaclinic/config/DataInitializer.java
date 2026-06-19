package com.sudhaclinic.config;

import com.sudhaclinic.entity.*;
import com.sudhaclinic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    private final InvoiceRepository invoiceRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Seed Medications
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
            }

            // Seed Patients & Other dependencies
            if (patientRepository.count() == 0) {
                log.info("Seeding initial patient data, appointments, vitals, and invoices...");

                List<Patient> patients = new ArrayList<>();
                patients.add(buildPatient("Priya Nair", "+91 98765 43210", LocalDate.of(1993, 5, 10), "Female", "Sankarankovil"));
                patients.add(buildPatient("Ramesh Kumar", "+91 98765 44228", LocalDate.of(1982, 8, 15), "Male", "Sankarankovil"));
                patients.add(buildPatient("Arjun Mehta", "+91 98876 54321", LocalDate.of(1995, 12, 20), "Male", "Tirunelveli"));
                patients.add(buildPatient("Sneha Iyer", "+91 82345 67890", LocalDate.of(1998, 4, 25), "Female", "Madurai"));
                patients.add(buildPatient("Vikram Singh", "+91 76543 21098", LocalDate.of(1987, 11, 30), "Male", "Tenkasi"));
                patients.add(buildPatient("Anita Desai", "+91 95432 10987", LocalDate.of(1991, 7, 12), "Female", "Sankarankovil"));
                patients.add(buildPatient("Mohammed Ali", "+91 94321 09876", LocalDate.of(1975, 3, 22), "Male", "Tenkasi"));

                List<Patient> savedPatients = patientRepository.saveAll(patients);



                // Seed Appointments
                LocalDate today = LocalDate.now();
                appointmentRepository.save(buildAppointment(savedPatients.get(1), "Dr. Mariyappan", today, "09:00 AM", "Dental Consultation", "COMPLETED", "Room A"));
                appointmentRepository.save(buildAppointment(savedPatients.get(0), "Dr. Mariyappan", today, "10:00 AM", "Root Canal Treatment", "IN_PROGRESS", "Room A"));
                appointmentRepository.save(buildAppointment(savedPatients.get(2), "Dr. Mariyappan", today, "11:00 AM", "Dental Cleaning", "UPCOMING", "Room B"));
                appointmentRepository.save(buildAppointment(savedPatients.get(3), "Dr. Mariyappan", today, "12:00 PM", "Tooth Extraction", "UPCOMING", "Room B"));
                appointmentRepository.save(buildAppointment(savedPatients.get(4), "Dr. Mariyappan", today, "01:00 PM", "Follow-up", "UPCOMING", "Room A"));

                // Seed Invoices
                invoiceRepository.save(buildInvoice(savedPatients.get(0), "INV-2025-0155", today, new BigDecimal("3500.00"), new BigDecimal("3500.00"), "PAID"));
                invoiceRepository.save(buildInvoice(savedPatients.get(1), "INV-2025-0156", today, new BigDecimal("1000.00"), new BigDecimal("0.00"), "PENDING"));
                invoiceRepository.save(buildInvoice(savedPatients.get(2), "INV-2025-0157", today, new BigDecimal("2000.00"), new BigDecimal("2000.00"), "PAID"));
                invoiceRepository.save(buildInvoice(savedPatients.get(3), "INV-2025-0158", today, new BigDecimal("2750.00"), new BigDecimal("2750.00"), "PAID"));
                invoiceRepository.save(buildInvoice(savedPatients.get(4), "INV-2025-0159", today, new BigDecimal("1800.00"), new BigDecimal("1800.00"), "PAID"));

                log.info("Successfully seeded patient dependencies.");
            }

            // Seed Staff members
            if (staffMemberRepository.count() == 0) {
                log.info("Seeding initial staff member data...");
                staffMemberRepository.save(buildStaff("Dr. Mariyappan", "+91 98765 43210", "mariyappan@sudhaclinic.com", "DENTIST", "ACTIVE", "09:00 AM", "05:00 PM"));
                staffMemberRepository.save(buildStaff("Sudha", "+91 98765 43211", "sudha@sudhaclinic.com", "ADMIN", "ACTIVE", "09:00 AM", "05:00 PM"));
                staffMemberRepository.save(buildStaff("Rahul", "+91 98765 43212", "rahul@sudhaclinic.com", "RECEPTIONIST", "ACTIVE", "09:00 AM", "05:00 PM"));
                staffMemberRepository.save(buildStaff("Devi", "+91 98765 43213", "devi@sudhaclinic.com", "NURSE", "ACTIVE", "08:00 AM", "04:00 PM"));
                log.info("Seeded staff members successfully.");
            }

            // Seed Chat Messages
            if (chatMessageRepository.count() == 0) {
                log.info("Seeding initial chat message data...");
                chatMessageRepository.save(buildChat("System", "ADMIN", "+91 98765 43210", "Dear Priya, your appointment is scheduled for tomorrow at 10:00 AM.", "SENT", "WHATSAPP"));
                chatMessageRepository.save(buildChat("Devi", "NURSE", "+91 98765 43210", "Your vital signs have been successfully logged. BP: 120/80 mmHg.", "SENT", "SMS"));
                chatMessageRepository.save(buildChat("Priya Nair", "PATIENT", "+91 98765 43210", "Thank you, I will be on time.", "READ", "INTERNAL"));
                chatMessageRepository.save(buildChat("Dr. Mariyappan", "DENTIST", "+91 98765 44228", "Dear Ramesh, please take the prescribed Amoxicillin thrice daily after meals.", "SENT", "WHATSAPP"));
                log.info("Seeded chat messages successfully.");
            }

            // Seed Clinic Settings
            if (clinicSettingsRepository.count() == 0) {
                log.info("Seeding clinic settings...");
                clinicSettingsRepository.save(ClinicSettings.builder()
                        .clinicName("Sudha Dental Clinic")
                        .phone("+91 98765 43210")
                        .address("Sankarankovil, Tamil Nadu")
                        .dailyPin("1234")
                        .whatsappAccessToken("YOUR_ACCESS_TOKEN")
                        .whatsappPhoneId("YOUR_PHONE_NUMBER_ID")
                        .build());
                log.info("Seeded clinic settings successfully.");
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

    private Patient buildPatient(String name, String phone, LocalDate dob, String gender, String address) {
        Patient p = new Patient();
        p.setName(name);
        p.setPhone(phone);
        p.setDob(dob);
        p.setGender(gender);
        p.setAddress(address);
        p.setCreatedAt(LocalDateTime.now());
        return p;
    }



    private Appointment buildAppointment(Patient patient, String doctor, LocalDate date, String time, String treatment, String status, String location) {
        return Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .appointmentTime(time)
                .treatment(treatment)
                .status(status)
                .location(location)
                .build();
    }

    private Invoice buildInvoice(Patient patient, String invNumber, LocalDate date, BigDecimal amount, BigDecimal paid, String status) {
        return Invoice.builder()
                .patient(patient)
                .invoiceNumber(invNumber)
                .invoiceDate(date)
                .amount(amount)
                .paidAmount(paid)
                .status(status)
                .build();
    }

    private StaffMember buildStaff(String name, String phone, String email, String role, String status, String start, String end) {
        return StaffMember.builder()
                .name(name)
                .phone(phone)
                .email(email)
                .role(role)
                .status(status)
                .shiftStart(start)
                .shiftEnd(end)
                .build();
    }

    private ChatMessage buildChat(String sender, String role, String phone, String text, String status, String type) {
        return ChatMessage.builder()
                .senderName(sender)
                .senderRole(role)
                .recipientPhone(phone)
                .messageText(text)
                .status(status)
                .type(type)
                .sentAt(LocalDateTime.now())
                .build();
    }
}
