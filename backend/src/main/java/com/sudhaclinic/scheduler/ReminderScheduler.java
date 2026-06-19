package com.sudhaclinic.scheduler;

import com.sudhaclinic.entity.Appointment;
import com.sudhaclinic.repository.AppointmentRepository;
import com.sudhaclinic.service.WhatsAppNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Scheduled task that runs daily at 18:00 to send WhatsApp reminders
 * to patients whose next appointment is tomorrow.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/scheduler")
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final WhatsAppNotificationService whatsappNotificationService;

    /**
     * Runs every day at 18:00 (6 PM) to send appointment reminders.
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("[REMINDER SCHEDULER] Running for date: {} (reminders for: {})", LocalDate.now(), tomorrow);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDate(tomorrow);
        log.info("[REMINDER SCHEDULER] Found {} appointments tomorrow.", appointments.size());

        for (Appointment appt : appointments) {
            if (appt.getPatient() != null && appt.getPatient().getPhone() != null) {
                sendWhatsAppReminder(appt, tomorrow);
            }
        }

        log.info("[REMINDER SCHEDULER] Completed processing {} reminders.", appointments.size());
    }

    /**
     * Manual trigger endpoint for testing reminders.
     * Call: GET /api/scheduler/test-reminders
     */
    @GetMapping("/test-reminders")
    public String triggerRemindersManually() {
        log.info("[REMINDER SCHEDULER] Manual trigger invoked.");
        sendDailyReminders();
        return "Reminder scheduler triggered. Check application logs for output.";
    }

    private void sendWhatsAppReminder(Appointment appt, LocalDate appointmentDate) {
        String patientName = appt.getPatient().getName();
        String phone = appt.getPatient().getPhone();
        String formattedDate = appointmentDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        // Log the payload (always, for audit trail)
        log.info("[WHATSAPP REMINDER] ----------------------------------------");
        log.info("[WHATSAPP REMINDER] To      : {}", phone);
        log.info("[WHATSAPP REMINDER] Patient : {}", patientName);
        log.info("[WHATSAPP REMINDER] Date    : {}", formattedDate);
        log.info("[WHATSAPP REMINDER] Sending reminder via Meta Cloud API...");
        log.info("[WHATSAPP REMINDER] ----------------------------------------");

        boolean success = whatsappNotificationService.sendTemplateReminder(phone, patientName, formattedDate);
        if (success) {
            log.info("[WHATSAPP REMINDER] Meta notification sent successfully for {}.", patientName);
        } else {
            log.warn("[WHATSAPP REMINDER] Meta notification failed or fell back to mock for {}.", patientName);
        }
    }
}
