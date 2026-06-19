package com.sudhaclinic.repository;

import com.sudhaclinic.entity.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
}
