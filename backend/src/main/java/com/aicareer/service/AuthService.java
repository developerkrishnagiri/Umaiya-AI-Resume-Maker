package com.aicareer.service;

import com.aicareer.dto.AuthDTOs.*;
import com.aicareer.entity.PasswordResetToken;
import com.aicareer.entity.User;
import com.aicareer.enums.UserRole;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.PasswordResetTokenRepository;
import com.aicareer.repository.UserRepository;
import com.aicareer.security.JwtUtil;
import com.aicareer.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        UserRole role = req.getEmail().equalsIgnoreCase("admin@admin.com")
                ? UserRole.ADMIN
                : ("RECRUITER".equalsIgnoreCase(req.getRole())
                        ? UserRole.RECRUITER
                        : UserRole.JOBSEEKER);

        User user = User.builder()
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(role)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        // Send verification email (async)
        String token = UUID.randomUUID().toString();
        PasswordResetToken verifyToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        tokenRepository.save(verifyToken);
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!user.getActive()) {
            throw new ApiException("Account deactivated. Contact support.", HttpStatus.FORBIDDEN);
        }

        return buildAuthResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(user -> {
            tokenRepository.deleteByUserId(user.getId());
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user).token(token)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .used(false).build();
            tokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
        });
        // Always return OK to prevent email enumeration
    }

    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = tokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new ApiException("Invalid or expired token", HttpStatus.BAD_REQUEST));

        if (token.getUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Token expired or already used", HttpStatus.BAD_REQUEST);
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        token.setUsed(true);
        tokenRepository.save(token);
    }

    public void verifyEmail(VerifyEmailRequest req) {
        PasswordResetToken token = tokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new ApiException("Invalid verification token", HttpStatus.BAD_REQUEST));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Verification link expired", HttpStatus.BAD_REQUEST);
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    public AuthResponse refreshToken(RefreshTokenRequest req) {
        try {
            String email = jwtUtil.extractUsername(req.getRefreshToken());
            UserDetails ud = userDetailsService.loadUserByUsername(email);
            if (!jwtUtil.isTokenValid(req.getRefreshToken(), ud)) {
                throw new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(ud);
        String refreshToken = jwtUtil.generateRefreshToken(ud);

        AuthResponse.UserInfo info = new AuthResponse.UserInfo();
        info.setId(user.getId());
        info.setEmail(user.getEmail());
        info.setFirstName(user.getFirstName());
        info.setLastName(user.getLastName());
        info.setRole(user.getRole().name());
        info.setPlanType(user.getPlanType().name());
        info.setAvatarUrl(user.getAvatarUrl());

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(info);
        return response;
    }
}
