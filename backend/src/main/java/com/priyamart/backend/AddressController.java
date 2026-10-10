
package com.priyamart.backend;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    private boolean isAuthorized(Integer userId, HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        return session != null
                && "BUYER".equals(session.getAttribute("role"))
                && session.getAttribute("userId") instanceof Number
                && ((Number) session.getAttribute("userId")).longValue()
                        == userId.longValue();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getAddress(
            @PathVariable Integer userId,
            HttpServletRequest request) {

        if (!isAuthorized(userId, request)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Access denied."));
        }

        return addressRepository.findByUserId(userId)
                .map(address -> ResponseEntity.ok((Object) address))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body((Object) Map.of("message", "Address not found.")));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> saveAddress(
            @PathVariable Integer userId,
            @RequestBody Address newAddress,
            HttpServletRequest request) {

        if (!isAuthorized(userId, request)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Access denied."));
        }

        if (isBlank(newAddress.getFullName())
                || isBlank(newAddress.getPhone())
                || isBlank(newAddress.getAddressLine())
                || isBlank(newAddress.getCity())
                || isBlank(newAddress.getState())
                || isBlank(newAddress.getPincode())) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "All address fields are required."));
        }

        if (!newAddress.getPhone().matches("[0-9]{10}")
                || !newAddress.getPincode().matches("[0-9]{6}")) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid phone and pincode."));
        }

        Address address = addressRepository.findByUserId(userId)
                .orElse(new Address());

        address.setUserId(userId);
        address.setFullName(newAddress.getFullName().trim());
        address.setPhone(newAddress.getPhone().trim());
        address.setAddressLine(newAddress.getAddressLine().trim());
        address.setCity(newAddress.getCity().trim());
        address.setState(newAddress.getState().trim());
        address.setPincode(newAddress.getPincode().trim());

        return ResponseEntity.ok(addressRepository.save(address));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
