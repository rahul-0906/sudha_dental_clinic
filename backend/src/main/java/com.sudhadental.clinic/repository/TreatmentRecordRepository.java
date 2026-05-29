package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByPatientId(Long patientId);
}
