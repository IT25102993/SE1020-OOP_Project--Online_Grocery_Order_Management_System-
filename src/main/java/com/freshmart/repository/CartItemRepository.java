package com.freshmart.repository;

import com.freshmart.entity.CartItem;
import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCustomer(Customer customer);
    Optional<CartItem> findByCustomerAndProduct(Customer customer, Product product);

    @Transactional
    void deleteByCustomer(Customer customer);

    @Transactional
    void deleteByCustomerAndProduct(Customer customer, Product product);
}
