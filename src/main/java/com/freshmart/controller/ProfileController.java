package com.freshmart.controller;

import com.freshmart.entity.Customer;
import com.freshmart.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer")
public class ProfileController {

    private final CustomerRepository customerRepository;

    @Value("${app.upload.path:uploads}")
    private String uploadPath;

    public ProfileController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @PostMapping("/upload-profile-pic")
    public ResponseEntity<?> uploadProfilePic(@RequestParam("email") String email, @RequestParam("image") MultipartFile image) {
        try {
            Customer customer = customerRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No image provided"));
            }

            Path dir = Paths.get(uploadPath, "profile_pics").toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String originalFilename = image.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
            } else {
                ext = ".jpg";
            }

            String fileName = "profile_" + customer.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            Path filePath = dir.resolve(fileName);
            image.transferTo(filePath.toFile());

            String relativePath = "/uploads/profile_pics/" + fileName;
            customer.setProfilePicture(relativePath);
            customerRepository.save(customer);

            return ResponseEntity.ok(Map.of("success", true, "imagePath", relativePath));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
