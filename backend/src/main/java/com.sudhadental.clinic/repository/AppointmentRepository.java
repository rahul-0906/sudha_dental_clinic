package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByAppointmentTimeBetweenAndWhatsappReminderSentFalse(LocalDateTime start, LocalDateTime end);
}
