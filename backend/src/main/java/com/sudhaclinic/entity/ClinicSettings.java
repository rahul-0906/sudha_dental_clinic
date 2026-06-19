package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clinic_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clinicName;
    private String phone;
    private String address;
    private String dailyPin;

    private String whatsappAccessToken;
    private String whatsappPhoneId;
}
