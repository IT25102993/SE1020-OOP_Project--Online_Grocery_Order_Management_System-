package com.freshmart.controller;

import com.freshmart.entity.ProductQuantity;
import com.freshmart.service.ProductQuantityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-quantity")
public class ProductQuantityController {

    private final ProductQuantityService productQuantityService;

    public ProductQuantityController(ProductQuantityService productQuantityService) {
        this.productQuantityService = productQuantityService;
    }

    @PostMapping
    public ResponseEntity<?> addQuantity(@RequestBody Map<String, Object> body) {
        String productId = (String) body.get("productId");
        Object q = body.get("quantity");
        String whereBought = (String) body.get("whereBought");
        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product ID required"));
        }
        int quantity = 0;
        if (q instanceof Number) quantity = ((Number) q).intValue();
        else if (q != null) try { quantity = Integer.parseInt(q.toString()); } catch (NumberFormatException e) {}

        ProductQuantity pq = new ProductQuantity();
        pq.setProductId(productId.trim());
        pq.setQuantity(quantity);
        pq.setWhereBought(whereBought != null ? whereBought.trim() : "");
        pq = productQuantityService.save(pq);
        return ResponseEntity.ok(Map.of("success", true, "data", pq));
    }

    @GetMapping("/by-product/{productId}")
    public List<ProductQuantity> getByProductId(@PathVariable String productId) {
        return productQuantityService.findByProductId(productId);
    }

    @GetMapping
    public List<ProductQuantity> list() {
        return productQuantityService.findAll();
    }
}
