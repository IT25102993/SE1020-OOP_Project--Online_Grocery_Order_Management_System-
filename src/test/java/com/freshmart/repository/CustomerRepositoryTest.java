package com.freshmart.repository;

import com.freshmart.entity.Customer;
import com.freshmart.entity.PremiumCustomer;
import com.freshmart.entity.RegularCustomer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@org.springframework.test.context.ActiveProfiles("test")
public class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    public void testSaveAndRetrieveRegularCustomer() {
        RegularCustomer customer = new RegularCustomer();
        customer.setName("John Doe");
        customer.setEmail("john@example.com");
        customer.setAddress("123 Main St");
        customer.setPassword("secure123");

        Customer saved = customerRepository.save(customer);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCustomerType()).isEqualTo("REGULAR");

        Optional<Customer> found = customerRepository.findByEmailIgnoreCase("JOHN@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("John Doe");
        assertThat(found.get().getCustomerType()).isEqualTo("REGULAR");
    }

    @Test
    public void testSaveAndRetrievePremiumCustomer() {
        PremiumCustomer customer = new PremiumCustomer();
        customer.setName("Jane Smith");
        customer.setEmail("jane@example.com");
        customer.setAddress("456 High St");
        customer.setPassword("secret456");

        Customer saved = customerRepository.save(customer);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCustomerType()).isEqualTo("PREMIUM");

        Optional<Customer> found = customerRepository.findByEmailIgnoreCase("JANE@EXAMPLE.COM");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Jane Smith");
        assertThat(found.get().getCustomerType()).isEqualTo("PREMIUM");
    }

    @Test
    public void testExistsByEmailIgnoreCase() {
        RegularCustomer customer = new RegularCustomer();
        customer.setName("Alice");
        customer.setEmail("alice@example.com");
        customer.setAddress("789 Oak Ave");
        customer.setPassword("pass123");

        customerRepository.save(customer);

        boolean existsLower = customerRepository.existsByEmailIgnoreCase("alice@example.com");
        boolean existsUpper = customerRepository.existsByEmailIgnoreCase("ALICE@EXAMPLE.COM");
        boolean existsNone = customerRepository.existsByEmailIgnoreCase("bob@example.com");

        assertThat(existsLower).isTrue();
        assertThat(existsUpper).isTrue();
        assertThat(existsNone).isFalse();
    }
}
