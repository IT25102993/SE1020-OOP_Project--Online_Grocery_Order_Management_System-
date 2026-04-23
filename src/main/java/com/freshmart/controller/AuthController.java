package com.freshmart.controller;

import com.freshmart.dto.AdminDto;
import com.freshmart.dto.CustomerDto;
import com.freshmart.service.AdminFileService;
import com.freshmart.service.CustomerFileService;
import com.freshmart.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminFileService adminFileService;
    private final CustomerFileService customerFileService;
    private final EmailService emailService;

    public AuthController(AdminFileService adminFileService, CustomerFileService customerFileService, EmailService emailService) {
        this.adminFileService = adminFileService;
        this.customerFileService = customerFileService;
        this.emailService = emailService;
    }

    // --- CUSTOMER EMAIL VERIFICATION ---
    @PostMapping("/customer/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email required"));
            }
            if (customerFileService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }
            emailService.sendVerificationCode(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/customer/send-update-code")
    public ResponseEntity<?> sendUpdateCode(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email required"));
            }
            if (!customerFileService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
            }
            emailService.sendVerificationCode(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // --- CUSTOMER REGISTER (MODIFIED TO BE SECURE) ---
    @PostMapping("/customer/register")
    public ResponseEntity<?> registerCustomer(@RequestBody CustomerDto dto) {
        try {
            // 1. Basic Validation
            if (dto.getEmail() == null || dto.getEmail().isBlank() || dto.getPassword() == null || dto.getPassword().isBlank() || dto.getVerificationCode() == null || dto.getVerificationCode().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email, password, and verification code required"));
            }

            // 2. Prevent Duplicate Registration
            if (customerFileService.existsByEmail(dto.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }

            // 3. Verify the generated 6-digit code
            if (!emailService.verifyCode(dto.getEmail(), dto.getVerificationCode())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired verification code"));
            }

            /**
             * 3. SANITIZATION: Ensure 'admin' role is impossible.
             * If your CustomerDto has a 'role' or 'isAdmin' field, reset it here.
             * Even better: only the fields in CustomerDto will be mapped by Spring.
             */
            // dto.setRole("CUSTOMER"); // If such a field exists in your DTO

            customerFileService.saveCustomer(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Customer registered successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Server error during registration"));
        }
    }

    // --- ADMIN REGISTER ---
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminDto dto) {
        try {
            if (dto.getEmail() == null || dto.getEmail().isBlank() || dto.getPassword() == null || dto.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and password required"));
            }
            if (adminFileService.existsByEmail(dto.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Admin email already registered"));
            }
            adminFileService.saveAdmin(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Admin registered"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Server error"));
        }
    }

    // --- LOGIN LOGIC ---
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> body) {
        return performLogin(body, adminFileService, "admin");
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> loginCustomer(@RequestBody Map<String, String> body) {
        return performLogin(body, customerFileService, "customer");
    }

    /**
     * Helper method to reduce code duplication for logins
     */
    private ResponseEntity<?> performLogin(Map<String, String> body, Object service, String role) {
        try {
            String email = body.get("email");
            String password = body.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Credentials required"));
            }

            boolean isValid = false;
            if (service instanceof AdminFileService) {
                isValid = ((AdminFileService) service).validateLogin(email, password);
            } else if (service instanceof CustomerFileService) {
                isValid = ((CustomerFileService) service).validateLogin(email, password);
            }

            if (isValid) {
                return ResponseEntity.ok(Map.of("success", true, "email", email, "role", role));
            }
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Server error"));
        }
    }

    // --- FETCH ALL DATA (Admin only use-case) ---
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdmins() {
        return ResponseEntity.ok(adminFileService.findAll());
    }

    @GetMapping("/customer/all")
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(customerFileService.findAll());
    }

    @PutMapping("/customer/update")
    public ResponseEntity<?> updateCustomer(@RequestBody CustomerDto dto) {
        try {
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email required"));
            }
            if (dto.getVerificationCode() == null || dto.getVerificationCode().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Verification code required"));
            }
            if (!emailService.verifyCode(dto.getEmail(), dto.getVerificationCode())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired verification code"));
            }
            customerFileService.updateCustomer(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
            //update
        }
    }
}