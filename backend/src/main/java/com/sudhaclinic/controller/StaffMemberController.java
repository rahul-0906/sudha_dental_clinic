package com.sudhaclinic.controller;

import com.sudhaclinic.entity.StaffMember;
import com.sudhaclinic.service.StaffMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"}, allowCredentials = "true")
@RequiredArgsConstructor
public class StaffMemberController {

    private final StaffMemberService staffMemberService;

    @GetMapping
    public ResponseEntity<List<StaffMember>> getAllStaff() {
        log.debug("GET /api/staff");
        return ResponseEntity.ok(staffMemberService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<?> addStaff(@RequestBody StaffMember staff) {
        log.info("POST /api/staff - Adding staff: {}", staff.getName());
        try {
            StaffMember saved = staffMemberService.addStaff(staff);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to add staff", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody StaffMember staff) {
        log.info("PUT /api/staff/{} - Updating staff", id);
        try {
            StaffMember updated = staffMemberService.updateStaff(id, staff);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to update staff", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        log.info("DELETE /api/staff/{} - Deleting staff", id);
        try {
            staffMemberService.deleteStaff(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete staff", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
