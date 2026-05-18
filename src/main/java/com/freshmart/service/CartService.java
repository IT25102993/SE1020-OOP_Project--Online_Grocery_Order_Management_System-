package com.freshmart.service;

import com.freshmart.entity.CartItem;
import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import com.freshmart.repository.CartItemRepository;
import com.freshmart.repository.CustomerRepository;
import com.freshmart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository,
                       CustomerRepository customerRepository,
                       ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public List<CartItem> getCart(String customerEmail) {
        Customer customer = findCustomer(customerEmail);
        return cartItemRepository.findByCustomerOrderByIdAsc(customer);
    }

    @Transactional
    public CartItem addToCart(String customerEmail, String productId, Integer quantity) {
        Customer customer = findCustomer(customerEmail);
        Product product = findProduct(productId);
        int qtyToAdd = normalizeQuantity(quantity);

        CartItem item = cartItemRepository.findByCustomerAndProduct(customer, product)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCustomer(customer);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        item.setQuantity(item.getQuantity() + qtyToAdd);
        return cartItemRepository.save(item);
    }

    @Transactional
    public CartItem updateQuantity(String customerEmail, String productId, Integer quantity) {
        Customer customer = findCustomer(customerEmail);
        Product product = findProduct(productId);
        int normalizedQuantity = normalizeQuantity(quantity);

        CartItem item = cartItemRepository.findByCustomerAndProduct(customer, product)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(normalizedQuantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(String customerEmail, String productId) {
        Customer customer = findCustomer(customerEmail);
        Product product = findProduct(productId);
        cartItemRepository.deleteByCustomerAndProduct(customer, product);
    }

    @Transactional
    public void clearCart(String customerEmail) {
        Customer customer = findCustomer(customerEmail);
        cartItemRepository.deleteByCustomer(customer);
    }

    private Customer findCustomer(String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank()) {
            throw new IllegalArgumentException("Customer email is required");
        }
        return customerRepository.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    private Product findProduct(String productId) {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("Product id is required");
        }
        return productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
    }

    private int normalizeQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            return 1;
        }
        return quantity;
    }
}
