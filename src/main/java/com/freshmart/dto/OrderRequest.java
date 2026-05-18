<<<<<<< HEAD
package com.freshmart.dto;

import java.util.List;

public class OrderRequest {
    private String customerEmail;
    private List<OrderItemRequest> items;
    private Double totalAmount;
    private String paymentMethod; // COD or CARD
    private String cardBank;      // bank name if CARD, else null
    private String cardNumber;
    private String cardExpiry;
    private String cardCvv;
    private String cardName;

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getCardBank() { return cardBank; }
    public void setCardBank(String cardBank) { this.cardBank = cardBank; }
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public String getCardExpiry() { return cardExpiry; }
    public void setCardExpiry(String cardExpiry) { this.cardExpiry = cardExpiry; }
    public String getCardCvv() { return cardCvv; }
    public void setCardCvv(String cardCvv) { this.cardCvv = cardCvv; }
    public String getCardName() { return cardName; }
    public void setCardName(String cardName) { this.cardName = cardName; }
}
=======
package com.freshmart.dto;

import java.util.List;

public class OrderRequest {
    private String customerEmail;
    private List<OrderItemRequest> items;
    private Double totalAmount;
    private String paymentMethod; // COD or CARD
    private String cardBank;      // bank name if CARD, else null

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getCardBank() { return cardBank; }
    public void setCardBank(String cardBank) { this.cardBank = cardBank; }
}
>>>>>>> cb611d33e0f030b1c35eca5ca478e26c454e9768
