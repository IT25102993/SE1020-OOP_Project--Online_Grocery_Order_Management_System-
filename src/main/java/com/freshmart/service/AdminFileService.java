package com.freshmart.service;

import com.freshmart.dto.AdminDto;
import com.freshmart.entity.Admin;
import com.freshmart.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminFileService {

    private final AdminRepository adminRepository;

    public AdminFileService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public void saveAdmin(AdminDto dto) {
        Admin admin = new Admin();
        admin.setEmail(dto.getEmail());
        admin.setPassword(dto.getPassword());
        adminRepository.save(admin);
    }

    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmailIgnoreCase(email);
    }

    public boolean validateLogin(String email, String password) {
        return adminRepository.findByEmailIgnoreCase(email)
                .map(admin -> admin.getPassword().equals(password))
                .orElse(false);
    }

    public List<AdminDto> findAll() {
        return adminRepository.findAll().stream().map(admin -> {
            AdminDto dto = new AdminDto();
            dto.setEmail(admin.getEmail());
            // Intentionally not sending password down if possible, but keeping it for existing structure
            dto.setPassword(admin.getPassword());
            return dto;
        }).collect(Collectors.toList());
    }
}
