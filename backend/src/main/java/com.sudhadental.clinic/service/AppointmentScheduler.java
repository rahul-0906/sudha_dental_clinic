package com.sudhadental.clinic.service;

import com.sudhadental.clinic.entity.Appointment;
import com.sudhadental.clinic.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentScheduler {

    private final AppointmentRepository appointmentRepository;
    private final WhatsAppService whatsAppService;

    // Runs daily at 8:00 AM to notify patients having appointments tomorrow
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDailyReminders() {
        log.info("Starting scheduled cron task: WhatsApp reminders for tomorrow's appointments.");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime startOfTomorrow = tomorrow.atStartOfDay();
        LocalDateTime endOfTomorrow = tomorrow.atTime(LocalTime.MAX);

        List<Appointment> upcoming = appointmentRepository
                .findByAppointmentTimeBetweenAndWhatsappReminderSentFalse(startOfTomorrow, endOfTomorrow);

        log.info("Retrieved {} pending notifications for tomorrow ({}).", upcoming.size(), tomorrow);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        for (Appointment app : upcoming) {
            String timeString = app.getAppointmentTime().format(timeFormatter);
            boolean success = whatsAppService.sendAppointmentReminder(
                    app.getPatient().getPhone(),
                    app.getPatient().getName(),
                    timeString,
                    app.getDentist().getFullName()
            );

            if (success) {
                app.setWhatsappReminderSent(true);
                appointmentRepository.save(app);
                log.info("Successfully notified patient {} and flagged status.", app.getPatient().getName());
            } else {
                log.warn("Failed to notify patient {}.", app.getPatient().getName());
            }
        }

        log.info("Daily scheduling reminder batch completed.");
    }
}
