
package com.priyamart.backend;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/sellers")
public class SellerApprovalController {

    private final userRepository userRepository;

    public SellerApprovalController(userRepository userRepository) {
        this.userRepository = userRepository;
    }

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        return session != null
                && session.getAttribute("userId") != null
                && "ADMIN".equals(session.getAttribute("role"));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> pendingSellers(
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Admin access required"));
        }

        List<Map<String, Object>> sellers =
                userRepository.findAll()
                    .stream()
                    .filter(u -> "SELLER_PENDING".equals(u.getRole()))
                    .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail()
                    ))
                    .toList();

        return ResponseEntity.ok(sellers);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveSeller(
            @PathVariable Long id,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Admin access required"));
        }

        return userRepository.findById(id)
                .map(account -> {
                    if (!"SELLER_PENDING".equals(account.getRole())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of(
                                    "message",
                                    "Account is not pending"
                                ));
                    }

                    account.setRole("SELLER");
                    userRepository.save(account);

                    return ResponseEntity.ok(
                        Map.of(
                            "message",
                            "Seller approved successfully"
                        )
                    );
                })
                .orElseGet(() -> ResponseEntity.badRequest()
                        .body(Map.of(
                            "message",
                            "Seller not found"
                        )));
    }
}
