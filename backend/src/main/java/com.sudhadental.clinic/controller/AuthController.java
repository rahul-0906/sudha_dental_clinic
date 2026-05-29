package com.sudhadental.clinic.controller;

import com.sudhadental.clinic.entity.User;
import com.sudhadental.clinic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> opt = userRepository.findByUsername(username);
        if (opt.isPresent() && opt.get().getPassword().equals(password)) {
            User user = opt.get();
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "role", user.getRole().name()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials. Hint: use admin/password, dentist/password, or receptionist/password"));
    }
}
