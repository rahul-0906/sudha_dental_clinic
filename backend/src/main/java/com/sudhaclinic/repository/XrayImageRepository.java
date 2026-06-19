package com.sudhaclinic.repository;

import com.sudhaclinic.entity.XrayImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XrayImageRepository extends JpaRepository<XrayImage, Long> {

    /**
     * Returns all X-ray images for a given patient.
     */
    List<XrayImage> findByPatientId(Long patientId);
}
