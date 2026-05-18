package com.freshmart.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;

@Entity
@DiscriminatorValue("REGULAR")
public class RegularCustomer extends Customer {
}
