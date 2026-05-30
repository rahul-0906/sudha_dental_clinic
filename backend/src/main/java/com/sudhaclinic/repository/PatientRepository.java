package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Search patients by name or phone number (case-insensitive partial match).
     */
    List<Patient> findByPhoneContainingIgnoreCaseOrNameContainingIgnoreCase(String phone, String name);

    /**
     * Find a patient by exact phone number.
     */
    Optional<Patient> findByPhone(String phone);
}
