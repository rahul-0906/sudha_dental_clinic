package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String doctor;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String treatment;
    private String status; // COMPLETED, IN_PROGRESS, UPCOMING
    private String location;
}
