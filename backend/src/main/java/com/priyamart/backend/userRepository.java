package com.priyamart.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface userRepository extends JpaRepository<user, Long> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
    user findByUsername(String username);
    user findByEmail(String email);
}