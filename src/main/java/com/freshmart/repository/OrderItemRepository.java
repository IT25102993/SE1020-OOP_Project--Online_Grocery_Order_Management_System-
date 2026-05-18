package com.freshmart.repository;

import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import com.freshmart.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.order.customer = :customer AND oi.product = :product")
    Long countPreviousPurchases(@Param("customer") Customer customer, @Param("product") Product product);
}

