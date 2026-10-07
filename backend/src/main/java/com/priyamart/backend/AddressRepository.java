package com.priyamart.backend;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository
        extends JpaRepository<Address, Integer> {

    Optional<Address> findByUserId(Integer userId);
}