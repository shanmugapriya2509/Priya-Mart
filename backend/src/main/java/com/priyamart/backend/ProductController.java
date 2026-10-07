package com.priyamart.backend;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;


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
    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
    return productRepository.save(product);
}
@PutMapping("/products/{id}")
public Product updateProduct(@PathVariable int id,
                             @RequestBody Product updatedProduct) {

    Product product = productRepository.findById(id).orElseThrow();

    product.setName(updatedProduct.getName());
    product.setPrice(updatedProduct.getPrice());
    product.setCategory(updatedProduct.getCategory());
    product.setStock(updatedProduct.getStock());
    product.setDescription(updatedProduct.getDescription());

    return productRepository.save(product);
}

@DeleteMapping("/products/{id}")
public void deleteProduct(@PathVariable int id) {
    productRepository.deleteById(id);
}
    
}

