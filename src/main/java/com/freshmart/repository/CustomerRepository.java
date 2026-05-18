package com.freshmart.repository;

import com.freshmart.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE customers SET customer_type = :type WHERE id = :id", nativeQuery = true)
    void updateCustomerType(@Param("id") Long id, @Param("type") String type);
}
