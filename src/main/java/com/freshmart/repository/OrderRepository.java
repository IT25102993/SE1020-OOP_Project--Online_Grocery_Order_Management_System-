package com.freshmart.repository;

import com.freshmart.entity.Order;
import com.freshmart.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByOrderDateDesc(Customer customer);
    List<Order> findByStatus(String status);
}
