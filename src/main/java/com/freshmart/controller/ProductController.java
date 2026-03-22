package com.freshmart.controller;

import com.freshmart.entity.Product;
import com.freshmart.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @Value("${app.upload.path:uploads}")
    private String uploadPath;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> list() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-productId/{productId}")
    public ResponseEntity<Product> getByProductId(@PathVariable String productId) {
        return productService.findByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(
            @RequestParam String productId,
            @RequestParam String name,
            @RequestParam Double price,
            @RequestParam String category,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        if (productId == null || productId.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product ID and name required"));
        }
        if (productService.existsByProductId(productId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product ID already exists"));
        }

        Product product = new Product();
        product.setProductId(productId.trim());
        product.setName(name.trim());
        product.setPrice(price != null ? price : 0.0);
        product.setCategory(category != null ? category : "grocery");

        if (image != null && !image.isEmpty()) {
            Path dir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String ext = getExtension(image.getOriginalFilename());
            String fileName = productId.replaceAll("[^a-zA-Z0-9]", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + (ext != null ? ext : ".jpg");
            Path filePath = dir.resolve(fileName);
            image.transferTo(filePath.toFile());
            product.setImagePath("/uploads/" + fileName);
        }

        product = productService.save(product);
        return ResponseEntity.ok(Map.of("success", true, "product", product, "message", "Product added"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        return productService.findById(id).map(p -> {
            if (body.containsKey("name")) p.setName((String) body.get("name"));
            if (body.containsKey("price")) p.setPrice(body.get("price") instanceof Number ? ((Number) body.get("price")).doubleValue() : p.getPrice());
            if (body.containsKey("category")) p.setCategory((String) body.get("category"));
            if (body.containsKey("productId")) p.setProductId((String) body.get("productId"));
            productService.save(p);
            return ResponseEntity.ok(Map.of("success", true, "product", p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProductImage(@PathVariable Long id, @RequestParam MultipartFile image) throws IOException {
        return productService.findById(id).map(p -> {
            try {
                if (image == null || image.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No image"));
                Path dir = Paths.get(uploadPath).toAbsolutePath().normalize();
                Files.createDirectories(dir);
                String ext = getExtension(image.getOriginalFilename());
                String fileName = p.getProductId().replaceAll("[^a-zA-Z0-9]", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + (ext != null ? ext : ".jpg");
                Path filePath = dir.resolve(fileName);
                image.transferTo(filePath.toFile());
                p.setImagePath("/uploads/" + fileName);
                productService.save(p);
                return ResponseEntity.ok(Map.of("success", true, "imagePath", p.getImagePath(), "product", p));
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("success", false, "message", "Upload failed"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productService.findById(id).isPresent())
            return ResponseEntity.notFound().build();
        productService.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Product removed"));
    }

    private static String getExtension(String name) {
        if (name == null) return null;
        int i = name.lastIndexOf('.');
        return i > 0 ? name.substring(i) : null;
    }
}
