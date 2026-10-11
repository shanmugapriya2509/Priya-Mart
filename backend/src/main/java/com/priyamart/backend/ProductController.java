
package com.priyamart.backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    
@PostMapping("/api/seller/products/{id}/images")
public ResponseEntity<?> uploadProductImages(
        @PathVariable Integer id,
        @RequestParam("files") MultipartFile[] files,
        HttpServletRequest request) throws IOException {

    Long sellerId = getSellerId(request);

    if (sellerId == null) {
        return ResponseEntity.status(403).body(
            Map.of("message", "Seller login required")
        );
    }

    Product product = productRepository.findById(id).orElse(null);

    if (product == null) {
        return ResponseEntity.status(404).body(
            Map.of("message", "Product not found")
        );
    }

    if (!sellerId.equals(product.getSellerId())) {
        return ResponseEntity.status(403).body(
            Map.of("message", "Access denied")
        );
    }

    if (files == null || files.length == 0 ||
        files.length > 5) {
        return ResponseEntity.badRequest().body(
            Map.of("message", "Select 1 to 5 images")
        );
    }

    Path folder = Paths.get("uploads", "products")
            .toAbsolutePath().normalize();

    Files.createDirectories(folder);

    List<String> imageUrls = new ArrayList<>();

    for (MultipartFile file : files) {

        String contentType = file.getContentType();

        if (file.isEmpty() ||
            file.getSize() > 2 * 1024 * 1024 ||
            contentType == null ||
            !List.of("image/jpeg", "image/png", "image/webp")
                 .contains(contentType)) {

            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid image file")
            );
        }

        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        String filename = UUID.randomUUID() + extension;
        Path destination = folder.resolve(filename);

        Files.copy(file.getInputStream(), destination);

        imageUrls.add("/uploads/products/" + filename);
    }

    product.setImages(imageUrls);
    product.setImage(imageUrls.get(0));

    productRepository.save(product);

    return ResponseEntity.ok(
        Map.of("images", imageUrls)
    );
}

}
