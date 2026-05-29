package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByTreatmentRecordId(Long treatmentRecordId);
}
