package com.priyamart.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Address> getAddress(
            @PathVariable Integer userId) {

        return addressRepository
                .findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Address> saveAddress(
            @PathVariable Integer userId,
            @RequestBody Address newAddress) {

        Address address = addressRepository
                .findByUserId(userId)
                .orElse(new Address());

        address.setUserId(userId);
        address.setFullName(newAddress.getFullName());
        address.setPhone(newAddress.getPhone());
        address.setAddressLine(newAddress.getAddressLine());
        address.setCity(newAddress.getCity());
        address.setState(newAddress.getState());
        address.setPincode(newAddress.getPincode());

        Address saved =
                addressRepository.save(address);

        return ResponseEntity.ok(saved);
    }
}
