
package com.priyamart.backend;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    private Long getSellerId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null ||
            !"SELLER".equals(session.getAttribute("role")) ||
            !(session.getAttribute("userId") instanceof Number)) {
            return null;
        }

        return ((Number) session.getAttribute("userId")).longValue();
    }

    // Public product catalog
    @GetMapping("/products")
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    // Only products owned by the logged-in seller
    @GetMapping("/api/seller/products")
    public ResponseEntity<?> getSellerProducts(
            HttpServletRequest request) {

        Long sellerId = getSellerId(request);

        if (sellerId == null) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Seller login required"));
        }

        List<Product> ownProducts = productRepository.findAll()
            .stream()
            .filter(product ->
                sellerId.equals(product.getSellerId()))
            .toList();

        return ResponseEntity.ok(ownProducts);
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(
            @RequestBody Product product,
            HttpServletRequest request) {

        Long sellerId = getSellerId(request);

        if (sellerId == null) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Approved seller login required"));
        }

        // Never trust sellerId supplied by the browser
        product.setId(null);
        product.setSellerId(sellerId);

        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable int id,
            @RequestBody Product updatedProduct,
            HttpServletRequest request) {

        Long sellerId = getSellerId(request);

        if (sellerId == null) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Seller login required"));
        }

        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.status(404)
                .body(Map.of("message", "Product not found"));
        }

        if (!sellerId.equals(product.getSellerId())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "You cannot edit another seller's product"));
        }

        product.setName(updatedProduct.getName());
        product.setPrice(updatedProduct.getPrice());
        product.setCategory(updatedProduct.getCategory());
        product.setStock(updatedProduct.getStock());
        product.setDescription(updatedProduct.getDescription());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable int id,
            HttpServletRequest request) {

        Long sellerId = getSellerId(request);

        if (sellerId == null) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Seller login required"));
        }

        Product product = productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity.status(404)
                .body(Map.of("message", "Product not found"));
        }

        if (!sellerId.equals(product.getSellerId())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "You cannot delete another seller's product"));
        }

        productRepository.delete(product);

        return ResponseEntity.ok(
            Map.of("message", "Product deleted successfully"));
    }
}
