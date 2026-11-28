package com.eventix.modules.auth.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.modules.auth.dto.AuthResponse;
import com.eventix.modules.auth.dto.LoginRequest;
import com.eventix.modules.auth.dto.RegisterRequest;
import com.eventix.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Đăng ký tài khoản thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(request));
    }

    // API Test dành cho bất kỳ ai đã đăng nhập
    @GetMapping("/me")
    public ApiResponse<String> getCurrentUser(Authentication authentication) {
        return ApiResponse.ok("Xin chào, " + authentication.getName() + "! Bạn đã xác thực thành công.");
    }

    // API Test phân quyền RBAC: Chỉ duy nhất ADMIN mới gọi được
    @GetMapping("/admin-only")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<String> testAdminOnly() {
        return ApiResponse.ok("Chúc mừng! Bạn đang truy cập tài nguyên bảo mật cao của ADMIN.");
    }

    // API Lấy danh sách toàn bộ người dùng cho ADMIN
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<java.util.List<com.eventix.modules.auth.dto.UserResponse>> getAllUsers() {
        return ApiResponse.ok("Lấy danh sách người dùng thành công", authService.getAllUsers());
    }
}