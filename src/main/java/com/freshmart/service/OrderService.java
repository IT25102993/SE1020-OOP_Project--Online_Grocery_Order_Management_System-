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
    private final PaymentRepository paymentRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        DriverRepository driverRepository, CustomerRepository customerRepository,
                        PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Order placeOrder(Order order, com.freshmart.dto.OrderRequest request) {
        order.setStatus("REQUESTED");
        order.setOrderDate(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        payment.setCardBank(request.getCardBank());
        payment.setCardNumber(request.getCardNumber());
        payment.setCardExpiry(request.getCardExpiry());
        payment.setCardCvv(request.getCardCvv());
        payment.setCardName(request.getCardName());
        payment.setAmount(savedOrder.getTotalAmount());
        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        return savedOrder;
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
    public Payment updatePaymentStatus(Long paymentId, String status) {
        return paymentRepository.findById(paymentId).map(payment -> {
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found"));
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

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Long getPastProductQuantity(Customer customer, Product product) {
        return orderItemRepository.countPreviousPurchases(customer, product);
    }
}

