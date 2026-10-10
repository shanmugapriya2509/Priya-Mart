
package com.priyamart.backend;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null ||
            session.getAttribute("userId") == null ||
            !"BUYER".equals(session.getAttribute("role"))) {

            return ResponseEntity.status(401).body(
                Map.of("message", "Please log in as a customer to place an order.")
            );
        }

        Long loggedInUserId =
            ((Number) session.getAttribute("userId")).longValue();

        if (request.getUserId() == null ||
            loggedInUserId != request.getUserId().longValue()) {

            return ResponseEntity.status(403).body(
                Map.of("message", "Invalid user ID.")
            );
        }

        if (request.getItems() == null ||
            request.getItems().isEmpty()) {

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

            return ResponseEntity.badRequest().body(
                Map.of("message", "Cart is empty.")
            );
        }

        double total = 0;

        for (OrderItem item : request.getItems()) {
            total += item.getPrice() * item.getQuantity();
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
}
