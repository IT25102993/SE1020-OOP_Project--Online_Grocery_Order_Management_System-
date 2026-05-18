package com.freshmart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductQuantityRepository extends JpaRepository<ProductQuantity, Long> {
    List<ProductQuantity> findByProductIdOrderByCreatedAtDesc(String productId);
}
