package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    /**
     * Returns all prescription line items for a given visit.
     */
    List<Prescription> findByVisitId(Long visitId);
}
