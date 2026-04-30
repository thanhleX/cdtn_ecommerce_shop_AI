package com.example.shop.domain.repository;

import com.example.shop.domain.entity.OrderItem;
import com.example.shop.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(oi) > 0 FROM OrderItem oi JOIN oi.order o JOIN oi.productVariant pv WHERE o.user.id = :userId AND pv.product.id = :productId AND o.status IN (:statuses)")
    boolean existsByUserIdAndProductIdAndOrderStatusIn(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("statuses") List<com.example.shop.domain.enums.OrderStatus> statuses);
}
