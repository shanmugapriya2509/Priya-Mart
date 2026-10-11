package com.priyamart.backend;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer userId;
    private double totalAmount;
    private String status;
    private LocalDateTime orderDate;
    private Integer addressId;
    private String paymentMethod;
    private String cancellationReason;

    public Order() {
    }

    public Integer getId() {
        return id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Integer getAddressId() {
    return addressId;
}

public void setAddressId(Integer addressId) {
    this.addressId = addressId;
}

public String getPaymentMethod() {
    return paymentMethod;
}

public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
}


public String getCancellationReason() {
    return cancellationReason;
}

public void setCancellationReason(String cancellationReason) {
    this.cancellationReason = cancellationReason;
}

}