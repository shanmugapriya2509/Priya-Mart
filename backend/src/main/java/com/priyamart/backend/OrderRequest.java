package com.priyamart.backend;

import java.util.List;

public class OrderRequest {

    private Integer userId;
    private List<OrderItem> items;

    public OrderRequest() {
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}