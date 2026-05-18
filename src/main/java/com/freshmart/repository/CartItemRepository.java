package com.freshmart.repository;

import com.freshmart.entity.CartItem;
import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCustomerOrderByIdAsc(Customer customer);
    Optional<CartItem> findByCustomerAndProduct(Customer customer, Product product);
    void deleteByCustomerAndProduct(Customer customer, Product product);
    void deleteByCustomer(Customer customer);
}
