package com.sudhadental.clinic.repository;

import com.sudhadental.clinic.entity.User;
import com.sudhadental.clinic.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findByRole(Role role);
}
