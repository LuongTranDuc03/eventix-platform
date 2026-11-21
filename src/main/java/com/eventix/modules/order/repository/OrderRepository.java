package com.eventix.modules.order.repository;

import com.eventix.modules.order.entity.Order;
import com.eventix.modules.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    boolean existsByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM Order o WHERE o.userId = :userId AND o.eventId = :eventId AND o.status IN ('PENDING', 'PAID')")
    int sumQuantityByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);
}