package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByNameContainingIgnoreCaseOrPhoneContaining(String name, String phone);
}
