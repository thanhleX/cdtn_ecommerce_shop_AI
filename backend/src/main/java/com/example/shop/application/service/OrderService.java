package com.example.shop.application.service;

import com.example.shop.application.dto.request.PlaceOrderRequest;
import com.example.shop.application.dto.response.OrderResponse;
import com.example.shop.application.mapper.OrderMapper;
import com.example.shop.domain.entity.*;
import com.example.shop.domain.enums.NotificationType;
import com.example.shop.domain.enums.OrderStatus;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final OrderMapper orderMapper;

    private final VoucherService voucherService;

    @Lazy
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        // Filter items if cartItemIds is provided
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            cartItems = cartItems.stream()
                    .filter(item -> request.getCartItemIds().contains(item.getId()))
                    .toList();
        }

        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status(request.getPaymentMethodId() == 2 ? OrderStatus.AWAIT_PAYMENT : OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .address(address)
                .note(request.getNote())
                .build();

        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            if (variant.getQuantity() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            // Deduct stock
            variant.setQuantity(variant.getQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .variantAttributes(variant.getAttributesString())
                    .price(variant.getPrice())
                    .quantity(cartItem.getQuantity())
                    .totalAmount(itemTotal)
                    .build();

            orderItemRepository.save(orderItem);
        }

        order.setTotalAmount(totalAmount);

        // Handle Voucher
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            Voucher voucher = voucherService.validateVoucher(request.getVoucherCode(), userId,
                    totalAmount.doubleValue());
            Double discountDbl = voucherService.calculateDiscount(voucher, totalAmount.doubleValue());
            discountAmount = BigDecimal.valueOf(discountDbl);

            // Record Usage
            VoucherUsage usage = VoucherUsage.builder()
                    .voucher(voucher)
                    .user(user)
                    .order(order)
                    .usedAt(LocalDateTime.now())
                    .build();
            voucherUsageRepository.save(usage);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        orderRepository.save(order);

        // Notify Management about new order
        notificationService.notifyManagement(
                "Đơn hàng mới",
                "Có đơn hàng mới #" + order.getId() + " từ " + user.getFullName(),
                NotificationType.ORDER);

        // Clear cart
        cartItemRepository.deleteAll(cartItems);

        List<OrderItem> savedItems = orderItemRepository.findByOrder(order);
        return orderMapper.toOrderResponse(order, savedItems.stream().map(orderMapper::toOrderItemResponse).toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(Long userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        return orders.map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
        });
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Notify Management about cancellation
        notificationService.notifyManagement(
                "Đơn hàng bị khách hủy",
                "Đơn hàng #" + orderId + " đã bị khách hàng " + order.getUser().getFullName() + " hủy.",
                NotificationType.ORDER);

        // Restore stock
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        for (OrderItem item : items) {
            ProductVariant variant = item.getProductVariant();
            if (variant != null) {
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        // Revert Voucher Usage
        voucherUsageRepository.findByOrderId(orderId).ifPresent(voucherUsageRepository::delete);

        return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
        });
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(status);
        orderRepository.save(order);

        // Gửi notification cho customer
        String statusMsg = switch (status) {
            case CONFIRMED -> "Đơn hàng #" + orderId + " đã được xác nhận.";
            case SHIPPING -> "Đơn hàng #" + orderId + " đang được giao.";
            case COMPLETED -> "Đơn hàng #" + orderId + " đã hoàn thành.";
            case CANCELLED -> "Đơn hàng #" + orderId + " đã bị hủy.";
            default -> "Đơn hàng #" + orderId + " đã được cập nhật trạng thái.";
        };
        notificationService.createNotification(
                order.getUser().getId(),
                "Cập nhật đơn hàng",
                statusMsg,
                NotificationType.ORDER);

        // Notify Management about status update
        notificationService.notifyManagement(
                "Cập nhật đơn hàng #" + orderId,
                "Trạng thái đơn hàng đã được thay đổi thành: " + status.name(),
                NotificationType.ORDER);

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
    }
    @Transactional
    public OrderResponse confirmPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.AWAIT_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        order.setStatus(OrderStatus.PENDING);
        orderRepository.save(order);

        // Notify Management about payment
        notificationService.notifyManagement(
                "Thanh toán thành công",
                "Đơn hàng #" + orderId + " đã được thanh toán qua VNPay và chuyển sang trạng thái chờ xác nhận.",
                NotificationType.ORDER);

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        return orderMapper.toOrderResponse(order, items.stream().map(orderMapper::toOrderItemResponse).toList());
    }
}
