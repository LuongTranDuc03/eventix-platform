package com.eventix.modules.payment.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // API Giả lập thanh toán thành công cho đơn hàng
    @PostMapping("/simulate/{orderId}")
    public ApiResponse<Void> simulatePayment(@PathVariable Long orderId) {
        paymentService.simulatePaymentSuccess(orderId);
        return ApiResponse.ok("Thanh toán thành công. Hệ thống đang tiến hành xuất vé...", null);
    }
}