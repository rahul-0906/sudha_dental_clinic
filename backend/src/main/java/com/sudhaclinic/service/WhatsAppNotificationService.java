package com.sudhaclinic.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class WhatsAppNotificationService {

    @Value("${meta.whatsapp.base-url:https://graph.facebook.com/v19.0}")
    private String baseUrl;

    @Value("${meta.whatsapp.phone-number-id:NOT_CONFIGURED}")
    private String phoneNumberId;

    @Value("${meta.whatsapp.access-token:NOT_CONFIGURED}")
    private String accessToken;

    @Value("${meta.whatsapp.template-name:appointment_reminder}")
    private String templateName;

    @Value("${meta.whatsapp.template-language:en_US}")
    private String templateLanguage;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a template appointment reminder via Meta WhatsApp Cloud API.
     *
     * @param recipientPhone   Recipient's phone number
     * @param patientName      Name of the patient
     * @param appointmentDate  Formatted date of the appointment
     * @return true if sent successfully, false otherwise
     */
    public boolean sendTemplateReminder(String recipientPhone, String patientName, String appointmentDate) {
        if ("NOT_CONFIGURED".equals(phoneNumberId) || "NOT_CONFIGURED".equals(accessToken)) {
            log.warn("[META WHATSAPP] Service not configured. Logging notification payload instead.");
            log.info("[META WHATSAPP MOCK] To: {}, Patient: {}, Date: {}, Template: {}", 
                     recipientPhone, patientName, appointmentDate, templateName);
            return false;
        }

        // Format phone number to contain only digits. Meta API requires digits-only (e.g. 919876543210).
        String formattedPhone = recipientPhone.replaceAll("[^0-9]", "");
        if (formattedPhone.length() == 10) {
            formattedPhone = "91" + formattedPhone; // Default to India country code if 10-digit
        }

        String apiUrl = String.format("%s/%s/messages", baseUrl, phoneNumberId);

        try {
            // Build the Meta JSON Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("recipient_type", "individual");
            payload.put("to", formattedPhone);
            payload.put("type", "template");

            Map<String, Object> template = new HashMap<>();
            template.put("name", templateName);

            Map<String, Object> language = new HashMap<>();
            language.put("code", templateLanguage);
            template.put("language", language);

            List<Map<String, Object>> components = new ArrayList<>();
            Map<String, Object> bodyComponent = new HashMap<>();
            bodyComponent.put("type", "body");

            List<Map<String, Object>> parameters = new ArrayList<>();
            
            // Param 1: Patient Name
            Map<String, Object> param1 = new HashMap<>();
            param1.put("type", "text");
            param1.put("text", patientName);
            parameters.add(param1);

            // Param 2: Appointment Date
            Map<String, Object> param2 = new HashMap<>();
            param2.put("type", "text");
            param2.put("text", appointmentDate);
            parameters.add(param2);

            bodyComponent.put("parameters", parameters);
            components.add(bodyComponent);
            template.put("components", components);

            payload.put("template", template);

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            log.info("[META WHATSAPP] Dispatching template request to: {} (formatted: {})", recipientPhone, formattedPhone);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[META WHATSAPP] Successfully sent reminder to {}. Response: {}", recipientPhone, response.getBody());
                return true;
            } else {
                log.error("[META WHATSAPP] Failed to send reminder to {}. HTTP Status: {}, Response: {}", 
                          recipientPhone, response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("[META WHATSAPP] Exception occurred while sending reminder to {}: {}", recipientPhone, e.getMessage(), e);
            return false;
        }
    }
}
