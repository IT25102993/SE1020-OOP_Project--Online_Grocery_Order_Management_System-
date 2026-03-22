package com.freshmart.controller;

import com.freshmart.dto.OrderItemRequest;
import com.freshmart.dto.OrderRequest;
import com.freshmart.entity.*;
import com.freshmart.repository.CustomerRepository;
import com.freshmart.repository.ProductRepository;
import com.freshmart.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderService orderService, CustomerRepository customerRepository, ProductRepository productRepository) {
        this.orderService = orderService;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
        try {
            Customer customer = customerRepository.findByEmailIgnoreCase(request.getCustomerEmail())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Order order = new Order();
            order.setCustomer(customer);
            order.setTotalAmount(request.getTotalAmount());
            
            List<OrderItem> items = new ArrayList<>();
            if (request.getItems() != null) {
                for (OrderItemRequest ir : request.getItems()) {
                    Product product = productRepository.findByProductId(ir.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + ir.getProductId()));
                    OrderItem item = new OrderItem();
                    item.setProduct(product);
                    item.setQuantity(ir.getQuantity());
                    item.setPrice(ir.getPrice());
                    item.setOrder(order); // CRITICAL: Link item to order for JPA cascade
                    items.add(item);
                }
            }
            order.setItems(items);

            Order savedOrder = orderService.placeOrder(order);
            return ResponseEntity.ok(Map.of("success", true, "order", savedOrder));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/customer/{email}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .map(customer -> ResponseEntity.ok(orderService.getCustomerOrders(customer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order updated = orderService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "order", updated));
    }

    @PutMapping("/{id}/assign-driver")
    public ResponseEntity<?> assignDriver(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Order updated = orderService.assignDriver(id, body.get("driverId"));
        return ResponseEntity.ok(Map.of("success", true, "order", updated));
    }

    @GetMapping("/drivers")
    public List<Driver> getDrivers() {
        return orderService.getAllDrivers();
    }

    @PostMapping("/drivers")
    public Driver addDriver(@RequestBody Driver driver) {
        return orderService.saveDriver(driver);
    }
}
