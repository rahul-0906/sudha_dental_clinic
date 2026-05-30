package com.sudhaclinic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for Sudha Dental Clinic Management System backend.
 * Clinic: Sudha Dental Clinic, Sankarankovil
 * Doctor: Dr. Mariyappan
 */
@SpringBootApplication
@EnableScheduling
public class ClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicApplication.class, args);
    }
}
