package com.sudhadental.clinic.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentRequestDto {
    private Long patientId;
    private Long dentistId;
    private String chiefComplaint;
    private String diagnosis;
    private String procedureCompleted;
    private Double cost;
    private Double paidAmount;
    private List<PrescriptionDto> prescriptions;
}
