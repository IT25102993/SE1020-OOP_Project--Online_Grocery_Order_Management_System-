package com.freshmart.controller;

import com.freshmart.entity.CartItem;
import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import com.freshmart.repository.CartItemRepository;
import com.freshmart.repository.CustomerRepository;
import com.freshmart.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartController(CartItemRepository cartItemRepository,
                          CustomerRepository customerRepository,
                          ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/{email:.+}")
    public ResponseEntity<?> getCart(@PathVariable String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .map(customer -> ResponseEntity.ok(cartItemRepository.findByCustomer(customer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        try {
            String customerEmail = (String) body.get("customerEmail");
            String productId = (String) body.get("productId");
            Object q = body.get("quantity");

            if (customerEmail == null || productId == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and Product ID required"));
            }

            int quantity = 1;
            if (q instanceof Number) {
                quantity = ((Number) q).intValue();
            } else if (q != null) {
                try {
                    quantity = Integer.parseInt(q.toString());
                } catch (NumberFormatException e) {
                    // default to 1
                }
            }

            Customer customer = customerRepository.findByEmailIgnoreCase(customerEmail)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Product product = productRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem cartItem = cartItemRepository.findByCustomerAndProduct(customer, product)
                    .orElse(null);

            if (cartItem != null) {
                cartItem.setQuantity(cartItem.getQuantity() + quantity);
            } else {
                cartItem = new CartItem();
                cartItem.setCustomer(customer);
                cartItem.setProduct(product);
                cartItem.setQuantity(quantity);
            }

            cartItemRepository.save(cartItem);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product added to cart"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/update")
    @Transactional
    public ResponseEntity<?> updateCart(@RequestBody Map<String, Object> body) {
        try {
            String customerEmail = (String) body.get("customerEmail");
            String productId = (String) body.get("productId");
            Object q = body.get("quantity");

            if (customerEmail == null || productId == null || q == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email, Product ID and quantity required"));
            }

            int quantity = 0;
            if (q instanceof Number) {
                quantity = ((Number) q).intValue();
            } else {
                quantity = Integer.parseInt(q.toString());
            }

            Customer customer = customerRepository.findByEmailIgnoreCase(customerEmail)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Product product = productRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem cartItem = cartItemRepository.findByCustomerAndProduct(customer, product)
                    .orElseThrow(() -> new RuntimeException("Cart item not found"));

            if (quantity <= 0) {
                cartItemRepository.delete(cartItem);
            } else {
                cartItem.setQuantity(quantity);
                cartItemRepository.save(cartItem);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Cart item updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/remove")
    @Transactional
    public ResponseEntity<?> removeFromCart(@RequestParam String customerEmail, @RequestParam String productId) {
        try {
            Customer customer = customerRepository.findByEmailIgnoreCase(customerEmail)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Product product = productRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            cartItemRepository.deleteByCustomerAndProduct(customer, product);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/clear/{email:.+}")
    @Transactional
    public ResponseEntity<?> clearCart(@PathVariable String email) {
        try {
            Customer customer = customerRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            cartItemRepository.deleteByCustomer(customer);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cart cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
