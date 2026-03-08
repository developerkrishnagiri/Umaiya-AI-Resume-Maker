package com.aicareer.security;

import com.aicareer.entity.User;
import com.aicareer.enums.UserRole;
import com.aicareer.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        String provider = authToken.getAuthorizedClientRegistrationId();
        OAuth2User oAuth2User = authToken.getPrincipal();

        String email = "";
        String firstName = "";
        String lastName = "";
        String avatarUrl = "";
        String providerId = "";

        if ("google".equalsIgnoreCase(provider)) {
            email = oAuth2User.getAttribute("email");
            firstName = oAuth2User.getAttribute("given_name");
            lastName = oAuth2User.getAttribute("family_name");
            avatarUrl = oAuth2User.getAttribute("picture");
            providerId = oAuth2User.getAttribute("sub");
        } else if ("linkedin".equalsIgnoreCase(provider)) {
            email = oAuth2User.getAttribute("email"); // Modern API usually puts it here
            firstName = oAuth2User.getAttribute("localizedFirstName");
            lastName = oAuth2User.getAttribute("localizedLastName");
            providerId = oAuth2User.getAttribute("id");
            // avatarUrl might be complex to extract via standard LinkedIn endpoint without
            // extra calls
        }

        if (email == null || email.isEmpty()) {
            response.sendRedirect(frontendUrl + "/login?error=email_not_found_from_oauth_provider");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .firstName(firstName != null ? firstName : "User")
                    .lastName(lastName != null ? lastName : "")
                    .avatarUrl(avatarUrl)
                    .provider(provider)
                    .providerId(providerId)
                    .role(UserRole.JOBSEEKER)
                    .emailVerified(true)
                    .active(true)
                    .build();
            userRepository.save(user);
        } else {
            // Update existing user with provider details if missing
            if ("local".equals(user.getProvider())) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setEmailVerified(true);
                userRepository.save(user);
            }
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}
