package com.sudhaclinic.dto;

import com.sudhaclinic.entity.VisitStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for Visit responses. Includes patient info both as flat fields and nested object
 * (nested object for frontend compatibility with visit.patient.id / visit.patient.name).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitDTO {

    private Long id;

    /** Flat patient fields (legacy / convenience) */
    private Long patientId;
    private String patientName;
    private String patientPhone;

    /** Nested patient object — used by the frontend: visit.patient.id, visit.patient.name */
    private PatientSummary patient;

    private LocalDate visitDate;
    private String symptoms;
    private String consultationNotes;
    private String diagnosis;
    private BigDecimal consultationFee;
    private LocalDate nextVisitDate;
    private VisitStatus status;
    private LocalDateTime createdAt;

    /** Prescriptions are included when fetching a single visit detail */
    private List<PrescriptionDTO> prescriptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientSummary {
        private Long id;
        private String name;
        private String phone;
        private String gender;
        private String dob;
    }
}
