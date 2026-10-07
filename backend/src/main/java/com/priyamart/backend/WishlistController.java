package com.priyamart.backend;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin("*")
public class WishlistController {

    private final WishlistRepository wishlistRepository;

    public WishlistController(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }
    @GetMapping("/{userId}")
    public List<Wishlist> getWishlist(
            @PathVariable Integer userId) {

        return wishlistRepository.findByUserId(userId);
    }

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {

        if (wishlistRepository
                .existsByUserIdAndProductId(userId, productId)) {

            return ResponseEntity.ok("Already in wishlist");
        }

        Wishlist wishlist =
                new Wishlist(userId, productId);

        return ResponseEntity.ok(
                wishlistRepository.save(wishlist)
        );
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {

        return wishlistRepository
                .findByUserIdAndProductId(userId, productId)
                .map(item -> {

                    wishlistRepository.delete(item);

                    return ResponseEntity.ok(
                            "Removed from wishlist"
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}