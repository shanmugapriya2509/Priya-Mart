
package com.priyamart.backend;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewController(
            ReviewRepository reviewRepository,
            ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    // Display reviews for a product
    @GetMapping("/{productId}")
    public List<Review> getReviews(
            @PathVariable Integer productId) {
        return reviewRepository.findByProductId(productId);
    }

    // Submit a customer review
    @PostMapping("/{productId}")
    public ResponseEntity<?> addReview(
            @PathVariable Integer productId,
            @RequestBody Review review,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null ||
            !(session.getAttribute("userId") instanceof Number)) {
            return ResponseEntity.status(401)
                .body(Map.of("message", "Please login to review"));
        }

        if (!productRepository.existsById(productId)) {
            return ResponseEntity.status(404)
                .body(Map.of("message", "Product not found"));
        }

        if (review.getRating() == null ||
            review.getRating() < 1 ||
            review.getRating() > 5) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Rating must be 1 to 5"));
        }

        if (review.getComment() == null ||
            review.getComment().trim().isEmpty() ||
            review.getComment().length() > 1000) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Enter a review up to 1000 characters"));
        }

        Review newReview = new Review();
        newReview.setProductId(productId);
        newReview.setUserId(
            ((Number) session.getAttribute("userId")).longValue()
        );
        newReview.setRating(review.getRating());
        newReview.setComment(review.getComment().trim());

        return ResponseEntity.ok(reviewRepository.save(newReview));
    }

    
@GetMapping("/{productId}/summary")
public Map<String, Object> getReviewSummary(
        @PathVariable Integer productId) {

    List<Review> reviews =
        reviewRepository.findByProductId(productId);

    double average = reviews.stream()
        .mapToInt(Review::getRating)
        .average()
        .orElse(0.0);

    double roundedAverage =
        Math.round(average * 10.0) / 10.0;

    return Map.of(
        "average", roundedAverage,
        "count", reviews.size()
    );
  }

}
