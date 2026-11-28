package com.eventix.common.exception;

import com.eventix.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Bắt các lỗi nghiệp vụ do code chủ động ném ra (AppException)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(ex.getMessage() != null ? ex.getMessage() : errorCode.getMessage())
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    // 2. Bắt lỗi validate DTO (@Valid, @NotNull, @NotBlank...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .code(ErrorCode.VALIDATION_FAILED.getCode())
                .message(ErrorCode.VALIDATION_FAILED.getMessage())
                .data(errors)
                .build();

        return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.getHttpStatus()).body(response);
    }

    // 3. Bắt các lỗi hệ thống không lường trước được (NullPointerException, SQL
    // Exception...)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                .message("Lỗi hệ thống: " + ex.getMessage())
                .build();
        return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus()).body(response);
    }
}