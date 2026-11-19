package com.eventix.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // 4xx Client Errors
    INVALID_REQUEST(40001, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED(40002, "Dữ liệu đầu vào không đúng định dạng", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(40101, "Chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(40301, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    NOT_FOUND(40401, "Tài nguyên không tồn tại", HttpStatus.NOT_FOUND),

    EMAIL_ALREADY_EXISTS(40004, "Email này đã được đăng ký", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(40102, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),

    // Business Errors (Săn vé & Giao dịch)
    USER_HAS_PENDING_ORDER(40901, "Bạn đang có một đơn hàng chưa thanh toán", HttpStatus.CONFLICT),
    TICKET_LIMIT_EXCEEDED(40003, "Đã vượt quá số lượng vé tối đa được phép mua", HttpStatus.BAD_REQUEST),
    ZONE_SOLD_OUT(40902, "Khu vực này đã hết vé khả dụng", HttpStatus.CONFLICT),
    ORDER_EXPIRED(41001, "Đơn hàng giữ chỗ đã hết hạn 10 phút", HttpStatus.GONE),
    ORDER_ALREADY_CANCELLED(40903, "Đơn hàng này đã bị hủy trước đó", HttpStatus.CONFLICT),
    OPTIMISTIC_LOCK_CONFLICT(40904, "Hệ thống đang bận xử lý giao dịch song song, vui lòng thử lại",
            HttpStatus.CONFLICT),

    // 5xx Server Errors
    INTERNAL_SERVER_ERROR(50001, "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}