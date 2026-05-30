package com.sudhaclinic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Patient create/update requests and responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {

    private Long id;

    @NotBlank(message = "Patient name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private LocalDate dob;

    private String gender;

    private String address;

    private LocalDateTime createdAt;
}
