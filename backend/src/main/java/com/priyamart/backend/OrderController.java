
package com.priyamart.backend;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
@RestController
@RequestMapping("/api/orders")

public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;


public OrderController(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        ProductRepository productRepository,
        AddressRepository addressRepository) {

    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.productRepository = productRepository;
    this.addressRepository = addressRepository;
}

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null ||
            !(session.getAttribute("userId") instanceof Number) ||
            !"BUYER".equals(session.getAttribute("role"))) {

            return ResponseEntity.status(401).body(
                Map.of("message", "Please login as a customer.")
            );
        }

        long userId =
            ((Number) session.getAttribute("userId")).longValue();

        if (request.getUserId() == null ||
            request.getUserId().longValue() != userId) {

            return ResponseEntity.status(403).body(
                Map.of("message", "Invalid user ID.")
            );
        }

        if (request.getAddressId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Delivery address is required.")
            );
        }

        if (!"COD".equals(request.getPaymentMethod())) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Please select Cash on Delivery.")
            );
        }

        if (request.getItems() == null ||
            request.getItems().isEmpty()) {

            return ResponseEntity.badRequest().body(
                Map.of("message", "Cart is empty.")
            );
        }

        // Combine quantities for repeated product IDs
        java.util.Map<Integer, Integer> quantities =
            new java.util.TreeMap<>();

        for (OrderItem item : request.getItems()) {

            if (item.getProductId() == null ||
                item.getQuantity() <= 0) {

                return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid product or quantity.")
                );
            }

            quantities.merge(
                item.getProductId(),
                item.getQuantity(),
                Integer::sum
            );
        }

        // Lock products and check available stock
        java.util.Map<Integer, Product> lockedProducts =
            new java.util.HashMap<>();

        for (java.util.Map.Entry<Integer, Integer> entry
                : quantities.entrySet()) {

            Product product = productRepository
                .findByIdForUpdate(entry.getKey())
                .orElse(null);

            if (product == null) {
                return ResponseEntity.badRequest().body(
                    Map.of("message", "Product not found.")
                );
            }

            if (product.getStock() < entry.getValue()) {
                return ResponseEntity.badRequest().body(
                    Map.of(
                        "message",
                        "Not enough stock for " + product.getName()
                    )
                );
            }

            lockedProducts.put(entry.getKey(), product);
        }

        double total = 0;

        // Use database prices instead of browser prices
        for (OrderItem item : request.getItems()) {

            Product product = lockedProducts.get(item.getProductId());

            item.setPrice(product.getPrice());

            total += product.getPrice() * item.getQuantity();
        }

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(total);
        order.setStatus("PLACED");
        order.setAddressId(request.getAddressId());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : request.getItems()) {
            item.setOrderId(savedOrder.getId());
            orderItemRepository.save(item);
        }

        // Decrease product stock
        for (java.util.Map.Entry<Integer, Integer> entry
                : quantities.entrySet()) {

            Product product = lockedProducts.get(entry.getKey());

            product.setStock(
                product.getStock() - entry.getValue()
            );

            productRepository.save(product);
        }

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(
            @PathVariable Integer userId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("userId") == null ||
            !"BUYER".equals(session.getAttribute("role"))) {

            return ResponseEntity.status(401).body(
                Map.of("message", "Login required.")
            );
        }

        long loggedInUserId =
            ((Number) session.getAttribute("userId")).longValue();

        if (loggedInUserId != userId.longValue()) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Access denied.")
            );
        }

        return ResponseEntity.ok(
            orderRepository.findByUserIdOrderByOrderDateDesc(userId)
        );
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<?> getOrderItems(
            @PathVariable Integer orderId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("userId") == null ||
            !"BUYER".equals(session.getAttribute("role"))) {

            return ResponseEntity.status(401).body(
                Map.of("message", "Login required.")
            );
        }

        long loggedInUserId =
            ((Number) session.getAttribute("userId")).longValue();

        return orderRepository.findById(orderId)
            .map(order -> {
                if (order.getUserId().longValue() != loggedInUserId) {
                    return ResponseEntity.status(403).body(
                        (Object) Map.of("message", "Access denied.")
                    );
                }

                return ResponseEntity.ok(
                    (Object) orderItemRepository.findByOrderId(orderId)
                );
            })
            .orElseGet(() -> ResponseEntity.status(404).body(
                (Object) Map.of("message", "Order not found.")
            ));
    }
    @GetMapping("/seller")
public ResponseEntity<?> getSellerOrders(
        HttpServletRequest request) {

    HttpSession session = request.getSession(false);

    if (session == null ||
        !"SELLER".equals(session.getAttribute("role")) ||
        !(session.getAttribute("userId") instanceof Number)) {

        return ResponseEntity.status(403).body(
            Map.of("message", "Seller login required.")
        );
    }

    Long sellerId =
        ((Number) session.getAttribute("userId")).longValue();

    List<Map<String, Object>> sellerOrders =
        new java.util.ArrayList<>();

    for (Order order : orderRepository.findAll()) {

        for (OrderItem item :
                orderItemRepository.findByOrderId(order.getId())) {

            if (item.getProductId() == null) {
                continue;
            }

            Product product =
                productRepository.findById(item.getProductId())
                    .orElse(null);

            if (product == null ||
                !sellerId.equals(product.getSellerId())) {
                continue;
            }

            sellerOrders.add(Map.of(
                "orderId", order.getId(),
                "productName", item.getProductName(),
                "quantity", item.getQuantity(),
                "price", item.getPrice(),
                "total", item.getPrice() * item.getQuantity(),
                "status", order.getStatus()
            ));
        }
    }

    return ResponseEntity.ok(sellerOrders);
}

@PatchMapping("/{orderId}/cancel")
@Transactional
public ResponseEntity<?> cancelOrder(
        @PathVariable Integer orderId,
        @RequestBody Map<String, String> body,
        HttpServletRequest request) {

    String reason = body.get("reason");

    if (reason == null || reason.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(
            Map.of("message", "Cancellation reason is required.")
        );
    }


    HttpSession session = request.getSession(false);

    if (session == null ||
        !(session.getAttribute("userId") instanceof Number) ||
        !"BUYER".equals(session.getAttribute("role"))) {

        return ResponseEntity.status(401).body(
            Map.of("message", "Please login first.")
        );
    }

    long userId =
        ((Number) session.getAttribute("userId")).longValue();

    Order order = orderRepository.findById(orderId).orElse(null);

    if (order == null) {
        return ResponseEntity.status(404).body(
            Map.of("message", "Order not found.")
        );
    }

    if (order.getUserId() == null ||
        order.getUserId().longValue() != userId) {

        return ResponseEntity.status(403).body(
            Map.of("message", "Access denied.")
        );
    }

    String status = order.getStatus();

    if (!"PLACED".equals(status) &&
        !"CONFIRMED".equals(status)) {

        return ResponseEntity.badRequest().body(
            Map.of("message", "This order cannot be cancelled.")
        );
    }

for (OrderItem item : orderItemRepository.findByOrderId(orderId)) {

    if (item.getProductId() == null) {
        continue;
    }

    Product product = productRepository
        .findByIdForUpdate(item.getProductId())
        .orElse(null);

    if (product != null) {
        product.setStock(
            product.getStock() + item.getQuantity()
        );

        productRepository.save(product);
    }
}

    
order.setStatus("CANCELLED");
order.setCancellationReason(reason.trim());
orderRepository.save(order);


    return ResponseEntity.ok(
        Map.of("message", "Order cancelled successfully.")
    );
}

@PatchMapping("/{orderId}/status")
public ResponseEntity<?> updateOrderStatus(
        @PathVariable Integer orderId,
        @RequestBody Map<String, String> body,
        HttpServletRequest request) {

    HttpSession session = request.getSession(false);

    if (session == null ||
        !"SELLER".equals(session.getAttribute("role")) ||
        !(session.getAttribute("userId") instanceof Number)) {

        return ResponseEntity.status(403).body(
            Map.of("message", "Seller login required.")
        );
    }

    Long sellerId =
        ((Number) session.getAttribute("userId")).longValue();

    Order order = orderRepository.findById(orderId).orElse(null);

    if (order == null) {
        return ResponseEntity.status(404).body(
            Map.of("message", "Order not found.")
        );
    }

    boolean belongsToSeller = false;

    for (OrderItem item : orderItemRepository.findByOrderId(orderId)) {

        if (item.getProductId() == null) continue;

        Product product =
            productRepository.findById(item.getProductId()).orElse(null);

        if (product != null &&
            sellerId.equals(product.getSellerId())) {
            belongsToSeller = true;
            break;
        }
    }

    if (!belongsToSeller) {
        return ResponseEntity.status(403).body(
            Map.of("message", "Access denied.")
        );
    }

    String currentStatus = order.getStatus();
    String newStatus = body.get("status");

    Map<String, String> nextStatus = Map.of(
        "PLACED", "CONFIRMED",
        "CONFIRMED", "PACKED",
        "PACKED", "SHIPPED",
        "SHIPPED", "DELIVERED"
    );

    if (newStatus == null ||
        !newStatus.equals(nextStatus.get(currentStatus))) {

        return ResponseEntity.badRequest().body(
            Map.of("message", "Invalid order status transition.")
        );
    }

    order.setStatus(newStatus);
    orderRepository.save(order);

    return ResponseEntity.ok(
        Map.of("message", "Order status updated successfully.")
    );
}


}
