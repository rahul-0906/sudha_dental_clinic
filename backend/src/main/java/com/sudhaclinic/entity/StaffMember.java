package com.sudhaclinic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "staff_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Staff member name is required")
    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;
    
    private String role; // DENTIST, NURSE, RECEPTIONIST, ADMIN
    private String status; // ACTIVE, ON_BREAK, OFF_DUTY

    private String shiftStart; // e.g. "09:00 AM"
    private String shiftEnd;   // e.g. "05:00 PM"
}
