package com.freshmart.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;

@Entity
@DiscriminatorValue("PREMIUM")
public class PremiumCustomer extends Customer {
}
