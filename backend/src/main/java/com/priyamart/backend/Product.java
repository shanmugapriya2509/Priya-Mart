package com.priyamart.backend;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;


@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    
    @Column(name = "seller_id")
    private Long sellerId;


    private String name;
    private double price;
    private String category;

    private int stock = 0;

    @Column(length = 1000)
    private String description;

    private String brand;

private String unit;

private double originalPrice;

private int discount;

private String image;
@jakarta.persistence.ElementCollection
@jakarta.persistence.CollectionTable(
    name = "product_images",
    joinColumns = @jakarta.persistence.JoinColumn(name = "product_id")
)
@jakarta.persistence.Column(name = "image_url", length = 2000)
@jakarta.persistence.OrderColumn(name = "image_order")
private java.util.List<String> images = new java.util.ArrayList<>();

public java.util.List<String> getImages() {
    return images;
}

public void setImages(java.util.List<String> images) {
    this.images = images;
}
    public Product() {
    }

    public Product(Integer id, String name, double price, String category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
    return brand;
}

public void setBrand(String brand) {
    this.brand = brand;
}

public String getUnit() {
    return unit;
}

public void setUnit(String unit) {
    this.unit = unit;
}

public double getOriginalPrice() {
    return originalPrice;
}

public void setOriginalPrice(double originalPrice) {
    this.originalPrice = originalPrice;
}

public int getDiscount() {
    return discount;
}

public void setDiscount(int discount) {
    this.discount = discount;
}

public String getImage() {
    return image;
}

public void setImage(String image) {
    this.image = image;
}

public Long getSellerId() {
    return sellerId;
}

public void setSellerId(Long sellerId) {
    this.sellerId = sellerId;
}

}