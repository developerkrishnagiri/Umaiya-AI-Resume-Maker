package com.aicareer.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank String firstName;
        @NotBlank String lastName;
        @Email @NotBlank String email;
        @NotBlank @Size(min = 8) String password;
        String role; // JOBSEEKER or RECRUITER (defaults to JOBSEEKER)
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank String email;
        @NotBlank String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        @Email @NotBlank String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank String token;
        @NotBlank @Size(min = 8) String newPassword;
    }

    @Data
    public static class VerifyEmailRequest {
        @NotBlank String token;
    }

    @Data
    public static class AuthResponse {
        String accessToken;
        String refreshToken;
        String tokenType = "Bearer";
        UserInfo user;

        @Data
        public static class UserInfo {
            String id;
            String email;
            String firstName;
            String lastName;
            String role;
            String planType;
            String avatarUrl;
        }
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank String refreshToken;
    }

    @Data
    public static class UpdateProfileRequest {
        String firstName;
        String lastName;
        String phone;
        String headline;
        String location;
        String avatarUrl;
    }
}
