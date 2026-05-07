package com.example.shop.api.controller;

import com.example.shop.application.dto.request.PlaceOrderRequest;
import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.response.OrderResponse;
import com.example.shop.application.service.OrderService;
import com.example.shop.infrastructure.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import com.example.shop.application.dto.common.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Order management APIs for Customers")
@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order from cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse response = orderService.placeOrder(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Đặt hàng thành công"));
    }

    @GetMapping
    @Operation(summary = "Get current user's order history")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        Page<OrderResponse> response = orderService.getOrders(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(response), "Lấy lịch sử đơn hàng thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết đơn hàng thành công"));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, "Hủy đơn hàng thành công"));
    }

    @PostMapping("/{id}/confirm-payment")
    @Operation(summary = "Confirm payment for an order")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmPayment(
            @PathVariable Long id) {
        OrderResponse response = orderService.confirmPayment(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Xác nhận thanh toán thành công"));
    }
}
