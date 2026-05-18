package com.freshmart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freshmart.entity.CartItem;
import com.freshmart.entity.Customer;
import com.freshmart.entity.Product;
import com.freshmart.entity.RegularCustomer;
import com.freshmart.repository.CartItemRepository;
import com.freshmart.repository.CustomerRepository;
import com.freshmart.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
@org.springframework.test.context.ActiveProfiles("test")
public class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartItemRepository cartItemRepository;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetCartSuccess() throws Exception {
        Customer customer = new RegularCustomer();
        customer.setId(1L);
        customer.setName("Alice");
        customer.setEmail("alice@example.com");

        Product product = new Product();
        product.setId(1L);
        product.setProductId("P001");
        product.setName("Apples");
        product.setPrice(150.0);

        CartItem item = new CartItem();
        item.setId(10L);
        item.setCustomer(customer);
        item.setProduct(product);
        item.setQuantity(3);

        List<CartItem> cartItems = Collections.singletonList(item);

        Mockito.when(customerRepository.findByEmailIgnoreCase("alice@example.com"))
                .thenReturn(Optional.of(customer));
        Mockito.when(cartItemRepository.findByCustomer(customer))
                .thenReturn(cartItems);

        mockMvc.perform(get("/api/cart/alice@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].product.productId").value("P001"))
                .andExpect(jsonPath("$[0].product.name").value("Apples"))
                .andExpect(jsonPath("$[0].product.price").value(150.0))
                .andExpect(jsonPath("$[0].quantity").value(3));
    }

    @Test
    public void testGetCartCustomerNotFound() throws Exception {
        Mockito.when(customerRepository.findByEmailIgnoreCase("unknown@example.com"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cart/unknown@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testAddToCartSuccess() throws Exception {
        Customer customer = new RegularCustomer();
        customer.setId(1L);
        customer.setEmail("alice@example.com");

        Product product = new Product();
        product.setId(2L);
        product.setProductId("P002");

        Mockito.when(customerRepository.findByEmailIgnoreCase("alice@example.com"))
                .thenReturn(Optional.of(customer));
        Mockito.when(productRepository.findByProductId("P002"))
                .thenReturn(Optional.of(product));
        Mockito.when(cartItemRepository.findByCustomerAndProduct(customer, product))
                .thenReturn(Optional.empty());

        Map<String, Object> reqBody = Map.of(
                "customerEmail", "alice@example.com",
                "productId", "P002",
                "quantity", 2
        );

        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Product added to cart"));
    }

    @Test
    public void testUpdateCartSuccess() throws Exception {
        Customer customer = new RegularCustomer();
        customer.setId(1L);
        customer.setEmail("alice@example.com");

        Product product = new Product();
        product.setId(2L);
        product.setProductId("P002");

        CartItem cartItem = new CartItem();
        cartItem.setId(10L);
        cartItem.setCustomer(customer);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);

        Mockito.when(customerRepository.findByEmailIgnoreCase("alice@example.com"))
                .thenReturn(Optional.of(customer));
        Mockito.when(productRepository.findByProductId("P002"))
                .thenReturn(Optional.of(product));
        Mockito.when(cartItemRepository.findByCustomerAndProduct(customer, product))
                .thenReturn(Optional.of(cartItem));

        Map<String, Object> reqBody = Map.of(
                "customerEmail", "alice@example.com",
                "productId", "P002",
                "quantity", 5
        );

        mockMvc.perform(put("/api/cart/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Cart item updated"));
    }

    @Test
    public void testRemoveFromCartSuccess() throws Exception {
        Customer customer = new RegularCustomer();
        customer.setId(1L);
        customer.setEmail("alice@example.com");

        Product product = new Product();
        product.setId(2L);
        product.setProductId("P002");

        Mockito.when(customerRepository.findByEmailIgnoreCase("alice@example.com"))
                .thenReturn(Optional.of(customer));
        Mockito.when(productRepository.findByProductId("P002"))
                .thenReturn(Optional.of(product));

        mockMvc.perform(delete("/api/cart/remove")
                .param("customerEmail", "alice@example.com")
                .param("productId", "P002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Product removed from cart"));
    }

    @Test
    public void testClearCartSuccess() throws Exception {
        Customer customer = new RegularCustomer();
        customer.setId(1L);
        customer.setEmail("alice@example.com");

        Mockito.when(customerRepository.findByEmailIgnoreCase("alice@example.com"))
                .thenReturn(Optional.of(customer));

        mockMvc.perform(delete("/api/cart/clear/alice@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Cart cleared"));
    }
}
