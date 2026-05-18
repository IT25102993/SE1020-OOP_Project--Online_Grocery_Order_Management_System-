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
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order must contain at least one item"));
            }

            Customer customer = customerRepository.findByEmailIgnoreCase(request.getCustomerEmail())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Order order = new Order();
            order.setCustomer(customer);

            boolean isPremium = customer instanceof PremiumCustomer;
            double calculatedTotal = 0.0;

            List<OrderItem> items = new ArrayList<>();
            if (request.getItems() != null) {
                for (OrderItemRequest ir : request.getItems()) {
                    Product product = productRepository.findByProductId(ir.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + ir.getProductId()));
                    
                    double originalPrice = product.getPrice();
                    double finalPrice = originalPrice;

                    // Repeat-purchase discount: 5% off if purchased 3+ times in total in past
                    if (isPremium) {
                        Long pastQty = orderService.getPastProductQuantity(customer, product);
                        if (pastQty >= 3) {
                            finalPrice = originalPrice * 0.95;
                        }
                    }

                    OrderItem item = new OrderItem();
                    item.setProduct(product);
                    item.setQuantity(ir.getQuantity());
                    item.setPrice(finalPrice);
                    item.setOrder(order); // CRITICAL: Link item to order for JPA cascade
                    items.add(item);

                    calculatedTotal += finalPrice * ir.getQuantity();
                }
            }
            order.setItems(items);

            // Add delivery charge
            double deliveryCharge = isPremium ? 0.0 : 99.99;
            calculatedTotal += deliveryCharge;

            order.setTotalAmount(calculatedTotal);

            Order savedOrder = orderService.placeOrder(order, request);
            return ResponseEntity.ok(Map.of("success", true, "order", savedOrder));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/calculate-summary")
    public ResponseEntity<?> calculateSummary(@RequestBody OrderRequest request) {
        try {
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order must contain at least one item"));
            }

            Customer customer = customerRepository.findByEmailIgnoreCase(request.getCustomerEmail())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            boolean isPremium = customer instanceof PremiumCustomer;
            double subtotal = 0.0;
            double discount = 0.0;
            List<Map<String, Object>> itemSummaries = new ArrayList<>();

            if (request.getItems() != null) {
                for (OrderItemRequest ir : request.getItems()) {
                    Product product = productRepository.findByProductId(ir.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + ir.getProductId()));

                    double originalPrice = product.getPrice();
                    double finalPrice = originalPrice;
                    boolean hasDiscount = false;

                    if (isPremium) {
                        Long pastQty = orderService.getPastProductQuantity(customer, product);
                        if (pastQty >= 3) {
                            finalPrice = originalPrice * 0.95;
                            hasDiscount = true;
                        }
                    }

                    double itemTotal = finalPrice * ir.getQuantity();
                    subtotal += originalPrice * ir.getQuantity();
                    if (hasDiscount) {
                        discount += (originalPrice - finalPrice) * ir.getQuantity();
                    }

                    itemSummaries.add(Map.of(
                        "productId", product.getProductId(),
                        "name", product.getName(),
                        "quantity", ir.getQuantity(),
                        "originalPrice", originalPrice,
                        "finalPrice", finalPrice,
                        "hasDiscount", hasDiscount,
                        "itemTotal", itemTotal
                    ));
                }
            }

            double deliveryCharge = isPremium ? 0.0 : 99.99;
            double total = subtotal - discount + deliveryCharge;

            return ResponseEntity.ok(Map.of(
                "subtotal", subtotal,
                "discount", discount,
                "deliveryCharge", deliveryCharge,
                "total", total,
                "items", itemSummaries,
                "membershipType", customer.getCustomerType() != null ? customer.getCustomerType() : "REGULAR"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/customer/{email:.+}")
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
