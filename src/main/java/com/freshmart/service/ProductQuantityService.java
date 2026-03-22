package com.freshmart.service;

import com.freshmart.entity.ProductQuantity;
import com.freshmart.repository.ProductQuantityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductQuantityService {

    private final ProductQuantityRepository repository;

    public ProductQuantityService(ProductQuantityRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ProductQuantity save(ProductQuantity pq) {
        return repository.save(pq);
    }

    public List<ProductQuantity> findByProductId(String productId) {
        return repository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<ProductQuantity> findAll() {
        return repository.findAll();
    }
}
