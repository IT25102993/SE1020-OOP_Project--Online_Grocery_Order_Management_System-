package com.freshmart.service;

import com.freshmart.dto.CustomerDto;
import com.freshmart.entity.Customer;
import com.freshmart.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerFileService {

    private final CustomerRepository customerRepository;

    public CustomerFileService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public void saveCustomer(CustomerDto dto) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setPassword(dto.getPassword());
        customerRepository.save(customer);
    }

    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmailIgnoreCase(email);
    }

    public boolean validateLogin(String email, String password) {
        return customerRepository.findByEmailIgnoreCase(email)
                .map(customer -> customer.getPassword().equals(password))
                .orElse(false);
    }

    public List<CustomerDto> findAll() {
        return customerRepository.findAll().stream().map(customer -> {
            CustomerDto dto = new CustomerDto();
            dto.setName(customer.getName());
            dto.setEmail(customer.getEmail());
            dto.setAddress(customer.getAddress());
            dto.setPassword(customer.getPassword());
            return dto;
        }).collect(Collectors.toList());
    }

    public void updateCustomer(CustomerDto dto) {
        Customer customer = customerRepository.findByEmailIgnoreCase(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        customer.setName(dto.getName());
        customer.setAddress(dto.getAddress());
        customerRepository.save(customer);
    }
}
