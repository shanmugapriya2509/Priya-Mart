package com.priyamart.backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository
        extends JpaRepository<Wishlist, Integer> {

    List<Wishlist> findByUserId(Integer userId);

    Optional<Wishlist> findByUserIdAndProductId(
            Integer userId,
            Integer productId
    );

    boolean existsByUserIdAndProductId(
            Integer userId,
            Integer productId
    );
}