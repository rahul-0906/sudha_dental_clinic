package com.sudhadental.clinic.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDto {
    private String medicineName;
    private String dosage;
    private String duration;
    private String instructions;
}
