package com.priyamart.backend;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ProductController {
 
    private final ProductRepository productRepository;
    
    public ProductController(ProductRepository productRepository)
    {
        this.productRepository=productRepository;
    }
    @GetMapping("/products")
    public List<Product>getProducts() {
          return productRepository.findAll();

    }
    
}

