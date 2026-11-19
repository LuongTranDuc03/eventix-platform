package com.eventix.modules.auth.service;

import com.eventix.common.exception.AppException;
import com.eventix.common.exception.ErrorCode;
import com.eventix.config.security.JwtTokenProvider;
import com.eventix.modules.auth.dto.AuthResponse;
import com.eventix.modules.auth.dto.LoginRequest;
import com.eventix.modules.auth.dto.RegisterRequest;
import com.eventix.modules.auth.entity.Role;
import com.eventix.modules.auth.entity.User;
import com.eventix.modules.auth.repository.RoleRepository;
import com.eventix.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Mặc định người dùng đăng ký mới mang quyền ROLE_ATTENDEE
        Role attendeeRole = roleRepository.findByName("ROLE_ATTENDEE")
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy ROLE_ATTENDEE mặc định"));

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .roles(Set.of(attendeeRole))
                .isActive(true)
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(List.of(attendeeRole.getName()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản của bạn đã bị khóa");
        }

        String token = tokenProvider.generateToken(user);
        List<String> roleNames = user.getRoles().stream().map(Role::getName).toList();

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roleNames)
                .build();
    }
}