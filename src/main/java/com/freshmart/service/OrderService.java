package com.freshmart.service;

import com.freshmart.entity.*;
import com.freshmart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, 
                        DriverRepository driverRepository, CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public Order placeOrder(Order order) {
        order.setStatus("REQUESTED");
        order.setOrderDate(LocalDateTime.now());
        // Items are saved automatically due to cascade = CascadeType.ALL in Order entity
        // as long as item.setOrder(order) was called.
        return orderRepository.save(order);
    }

    public List<Order> getCustomerOrders(Customer customer) {
        return orderRepository.findByCustomerOrderByOrderDateDesc(customer);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order updateStatus(Long orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order assignDriver(Long orderId, Long driverId) {
        return orderRepository.findById(orderId).flatMap(order -> 
            driverRepository.findById(driverId).map(driver -> {
                order.setDriver(driver);
                return orderRepository.save(order);
            })
        ).orElseThrow(() -> new RuntimeException("Order or Driver not found"));
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver saveDriver(Driver driver) {
        return driverRepository.save(driver);
    }
}
