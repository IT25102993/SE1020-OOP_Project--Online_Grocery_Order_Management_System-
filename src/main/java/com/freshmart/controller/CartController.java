package com.freshmart.controller;

import com.freshmart.dto.CartItemRequest;
import com.freshmart.entity.CartItem;
import com.freshmart.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{customerEmail}")
    public ResponseEntity<List<CartItem>> getCart(@PathVariable String customerEmail) {
        return ResponseEntity.ok(cartService.getCart(customerEmail));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItemRequest request) {
        try {
            CartItem item = cartService.addToCart(
                    request.getCustomerEmail(),
                    request.getProductId(),
                    request.getQuantity()
            );
            return ResponseEntity.ok(Map.of("success", true, "cartItem", item));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(@RequestBody CartItemRequest request) {
        try {
            CartItem item = cartService.updateQuantity(
                    request.getCustomerEmail(),
                    request.getProductId(),
                    request.getQuantity()
            );
            return ResponseEntity.ok(Map.of("success", true, "cartItem", item));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeItem(@RequestParam String customerEmail, @RequestParam String productId) {
        try {
            cartService.removeItem(customerEmail, productId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/clear/{customerEmail}")
    public ResponseEntity<?> clearCart(@PathVariable String customerEmail) {
        try {
            cartService.clearCart(customerEmail);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
