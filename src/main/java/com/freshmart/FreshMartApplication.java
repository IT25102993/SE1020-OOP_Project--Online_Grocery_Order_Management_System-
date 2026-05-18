package com.freshmart;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class FreshMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreshMartApplication.class, args);
    }

    @Bean
    @org.springframework.context.annotation.Profile("!test")
    public CommandLineRunner databaseMigrator(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Update any null, empty, blank, or unrecognized discriminator values in the database to 'REGULAR'
                jdbcTemplate.update("UPDATE customers SET customer_type = 'REGULAR' WHERE customer_type IS NULL OR TRIM(customer_type) = '' OR customer_type NOT IN ('REGULAR', 'PREMIUM')");
                System.out.println(">>> Database migrated successfully: All unrecognized/empty customer types updated to REGULAR.");
            } catch (Exception e) {
                System.out.println(">>> Database migration skipped or table not created yet: " + e.getMessage());
            }
        };
    }
}
