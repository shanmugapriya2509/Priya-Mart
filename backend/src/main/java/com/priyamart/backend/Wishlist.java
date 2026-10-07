package com.priyamart.backend;

import jakarta.persistence.*;

@Entity
@Table(
    name = "wishlist",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "productId"})
    }
)
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer userId;
    private Integer productId;

    public Wishlist() {
    }

    public Wishlist(Integer userId, Integer productId) {
        this.userId = userId;
        this.productId = productId;
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

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }
}