package com.sudhaclinic.repository;

import com.sudhaclinic.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {
    List<StaffMember> findByRole(String role);
}
