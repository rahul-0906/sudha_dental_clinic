package com.sudhaclinic.service;

import com.sudhaclinic.entity.Appointment;
import com.sudhaclinic.entity.Patient;
import com.sudhaclinic.repository.AppointmentRepository;
import com.sudhaclinic.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        log.debug("Fetching all appointments");
        return appointmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        log.debug("Fetching appointments for date: {}", date);
        return appointmentRepository.findByAppointmentDate(date);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        log.debug("Fetching appointments for patient ID: {}", patientId);
        return appointmentRepository.findByPatientId(patientId);
    }

    @Transactional
    public Appointment createAppointment(Long patientId, String doctor, LocalDate date, String time, String treatment, String status, String location) {
        log.info("Creating appointment for patient ID: {} on {} at {}", patientId, date, time);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .appointmentTime(time)
                .treatment(treatment)
                .status(status != null ? status : "UPCOMING")
                .location(location)
                .build();

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatus(Long id, String status) {
        log.info("Updating appointment ID: {} status to: {}", id, status);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}
