package com.sudhadental.clinic.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${meta.whatsapp.phone-number-id}")
    private String phoneNumberId;

    @Value("${meta.whatsapp.developer-token}")
    private String developerToken;

    @Value("${meta.whatsapp.template-name}")
    private String templateName;

    @Value("${meta.whatsapp.api-version}")
    private String apiVersion;

    @Value("${clinic.name}")
    private String clinicName;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendAppointmentReminder(String recipientPhone, String patientName, String appointmentTime, String dentistName) {
        log.info("Preparing WhatsApp reminder template message for {} (Phone: {})", patientName, recipientPhone);

        // Sanitize phone number
        String cleanPhone = recipientPhone.replaceAll("[^0-9]", "");
        if (cleanPhone.startsWith("0")) {
            cleanPhone = cleanPhone.substring(1);
        }
        if (!cleanPhone.startsWith("91") && cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone; // default to Indian country code
        }

        // Meta API URL
        String url = String.format("https://graph.facebook.com/%s/%s/messages", apiVersion, phoneNumberId);

        // Prepare request body
        Map<String, Object> body = new HashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("to", cleanPhone);
        body.put("type", "template");

        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        
        Map<String, String> language = new HashMap<>();
        language.put("code", "en_US");
        template.put("language", language);

        List<Map<String, Object>> components = new ArrayList<>();
        Map<String, Object> bodyComponent = new HashMap<>();
        bodyComponent.put("type", "body");

        List<Map<String, String>> parameters = new ArrayList<>();
        parameters.add(Map.of("type", "text", "text", patientName));
        parameters.add(Map.of("type", "text", "text", appointmentTime));
        parameters.add(Map.of("type", "text", "text", dentistName));
        parameters.add(Map.of("type", "text", "text", clinicName));
        bodyComponent.put("parameters", parameters);
        components.add(bodyComponent);

        template.put("components", components);
        body.put("template", template);

        // Log visual representation of WhatsApp message
        log.info("─── WHATSAPP SIMULATION LOG ──────────────────────────────────");
        log.info("Recipient Phone: {}", cleanPhone);
        log.info("Template Name:   {}", templateName);
        log.info("Content Preview: 'Dear {}, you have an appointment scheduled on {} with Dr. {}. Thanks, {}'", 
                 patientName, appointmentTime, dentistName, clinicName);
        log.info("───────────────────────────────────────────────────────────────");

        // Check if token is mock/placeholder
        if (developerToken == null || developerToken.trim().isEmpty() || developerToken.contains("placeholder") || developerToken.contains("EAAGxxxx")) {
            log.info("Meta developer token is empty or placeholder. Reminder logged locally.");
            return true;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(developerToken);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Meta Cloud API sent WhatsApp message successfully: {}", response.getBody());
                return true;
            } else {
                log.error("Failed to send WhatsApp message. Response code: {}, Body: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Error communicating with Meta WhatsApp API: {}", e.getMessage());
            return false;
        }
    }
}
