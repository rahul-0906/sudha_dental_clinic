package com.sudhaclinic.service;

import com.sudhaclinic.entity.StaffMember;
import com.sudhaclinic.repository.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffMemberService {

    private final StaffMemberRepository staffMemberRepository;

    @Transactional(readOnly = true)
    public List<StaffMember> getAllStaff() {
        log.debug("Fetching all staff members");
        return staffMemberRepository.findAll();
    }

    @Transactional
    public StaffMember addStaff(StaffMember staff) {
        log.info("Adding new staff member: {} - {}", staff.getName(), staff.getRole());
        if (staff.getStatus() == null) {
            staff.setStatus("ACTIVE");
        }
        return staffMemberRepository.save(staff);
    }

    @Transactional
    public StaffMember updateStaff(Long id, StaffMember staffDetails) {
        log.info("Updating staff member ID: {}", id);
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));

        staff.setName(staffDetails.getName());
        staff.setPhone(staffDetails.getPhone());
        staff.setEmail(staffDetails.getEmail());
        staff.setRole(staffDetails.getRole());
        staff.setStatus(staffDetails.getStatus());
        staff.setShiftStart(staffDetails.getShiftStart());
        staff.setShiftEnd(staffDetails.getShiftEnd());

        return staffMemberRepository.save(staff);
    }

    @Transactional
    public void deleteStaff(Long id) {
        log.info("Deleting staff member ID: {}", id);
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));
        staffMemberRepository.delete(staff);
    }
}
