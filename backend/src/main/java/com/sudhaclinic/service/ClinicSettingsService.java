package com.sudhaclinic.service;

import com.sudhaclinic.entity.ClinicSettings;
import com.sudhaclinic.repository.ClinicSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicSettingsService {

    private final ClinicSettingsRepository clinicSettingsRepository;

    @Transactional
    public ClinicSettings getSettings() {
        log.debug("Loading clinic settings");
        List<ClinicSettings> list = clinicSettingsRepository.findAll();
        if (list.isEmpty()) {
            // Create default
            ClinicSettings defaultSettings = ClinicSettings.builder()
                    .clinicName("SUDHA Dental & Medical Clinic")
                    .phone("+91 98765 43210")
                    .address("Sankarankovil, Tamil Nadu")
                    .dailyPin("1234")
                    .whatsappAccessToken("YOUR_ACCESS_TOKEN")
                    .whatsappPhoneId("YOUR_PHONE_NUMBER_ID")
                    .build();
            return clinicSettingsRepository.save(defaultSettings);
        }
        return list.get(0);
    }

    @Transactional
    public ClinicSettings updateSettings(ClinicSettings newSettings) {
        log.info("Updating clinic settings");
        ClinicSettings current = getSettings();
        current.setClinicName(newSettings.getClinicName());
        current.setPhone(newSettings.getPhone());
        current.setAddress(newSettings.getAddress());
        current.setDailyPin(newSettings.getDailyPin());
        current.setWhatsappAccessToken(newSettings.getWhatsappAccessToken());
        current.setWhatsappPhoneId(newSettings.getWhatsappPhoneId());
        return clinicSettingsRepository.save(current);
    }
}
