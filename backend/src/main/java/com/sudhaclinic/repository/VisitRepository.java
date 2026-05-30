package com.sudhaclinic.repository;

import com.sudhaclinic.entity.Visit;
import com.sudhaclinic.entity.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {

    /**
     * Returns all visits for a patient, newest first.
     */
    List<Visit> findByPatientIdOrderByVisitDateDesc(Long patientId);

    /**
     * Returns all visits for a given date that are NOT in a specified status.
     * Used to fetch today's active queue (excluding DONE).
     */
    List<Visit> findByVisitDateAndStatusNot(LocalDate date, VisitStatus status);

    /**
     * Returns visits where the next visit date matches the given date.
     * Used by the reminder scheduler to find tomorrow's appointments.
     */
    List<Visit> findByNextVisitDate(LocalDate date);

    /**
     * Returns all visits for a given date.
     * Used for daily report calculations.
     */
    List<Visit> findByVisitDate(LocalDate date);
}
