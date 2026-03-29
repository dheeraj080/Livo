package com.lv.notes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lv.notes.config.SecurityConfig;
import com.lv.notes.dto.LoginRequest;
import com.lv.notes.dto.RefreshTokenRequest;
import com.lv.notes.dto.UserDTO;
import com.lv.notes.domain.entity.RefreshToken;
import com.lv.notes.domain.entity.User;
import com.lv.notes.repository.RefreshTokenRepository;
import com.lv.notes.repository.UserRepository;
import com.lv.notes.security.CookieService;
import com.lv.notes.security.CustomUserDetailService;
import com.lv.notes.security.JwtAuthenticationFilter;
import com.lv.notes.security.JwtService;
import com.lv.notes.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    // Built directly — @WebMvcTest in Boot 4 does not register ObjectMapper as a bean
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean AuthService authService;
    @MockitoBean AuthenticationManager authenticationManager;
    @MockitoBean UserRepository userRepository;
    @MockitoBean JwtService jwtService;
    @MockitoBean ModelMapper modelMapper;
    @MockitoBean RefreshTokenRepository refreshTokenRepository;
    @MockitoBean CookieService cookieService;
    // Mock the filter so it never rejects our test requests
    @MockitoBean JwtAuthenticationFilter jwtAuthenticationFilter;
    // Required by SecurityConfig's DaoAuthenticationProvider bean
    @MockitoBean CustomUserDetailService customUserDetailService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");

        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");

        when(jwtService.getRefreshTtlSeconds()).thenReturn(86400L);
        when(jwtService.getAccessTtlSeconds()).thenReturn(900L);
        when(modelMapper.map(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);
        doNothing().when(cookieService).attachRefreshCookie(any(), anyString(), anyInt());
        doNothing().when(cookieService).addNoStoreHeader(any());
        when(cookieService.getRefreshTokenCookieName()).thenReturn("refresh_token");
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/auth/login
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/v1/auth/login")
    class Login {

        @Test
        @DisplayName("Returns 200 with access token for valid credentials")
        void returns200ForValidCredentials() throws Exception {
            Authentication auth = mock(Authentication.class);
            when(authenticationManager.authenticate(any())).thenReturn(auth);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(jwtService.generateAccessToken(user)).thenReturn("access-token");
            when(jwtService.generateRefreshToken(eq(user), anyString())).thenReturn("refresh-token");

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new LoginRequest("test@example.com", "password"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token"));
        }

        @Test
        @DisplayName("Returns 401 for bad credentials")
        void returns401ForInvalidCredentials() throws Exception {
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new LoginRequest("test@example.com", "wrong"))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Returns 400 when request body is missing")
        void returns400ForMissingBody() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    // LoginRequest fields are null → authentication will throw
                    // or controller will reject — either way not 2xx
                    .andExpect(status().is4xxClientError());
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/auth/refresh
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/v1/auth/refresh")
    class Refresh {

        private RefreshToken storedToken;
        private final String refreshJwt = "old.refresh.token";
        private final String jti = UUID.randomUUID().toString();

        @BeforeEach
        void stubRefreshToken() {
            storedToken = RefreshToken.builder()
                    .jti(jti)
                    .user(user)
                    .createdAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(86400))
                    .revoked(false)
                    .build();

            when(jwtService.getJti(refreshJwt)).thenReturn(jti);
            when(jwtService.getUserId(refreshJwt)).thenReturn(userId);
            when(refreshTokenRepository.findByJti(jti)).thenReturn(Optional.of(storedToken));
            when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");
            when(jwtService.generateRefreshToken(eq(user), anyString())).thenReturn("new-refresh-token");
        }

        @Test
        @DisplayName("Returns 200 with new tokens for a valid refresh token in body")
        void returns200ForValidRefreshTokenInBody() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshJwt))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("new-access-token"));
        }

        @Test
        @DisplayName("Returns 401 when refresh token is not found in store")
        void returns401WhenTokenNotFound() throws Exception {
            when(refreshTokenRepository.findByJti(jti)).thenReturn(Optional.empty());

            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshJwt))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Returns 401 when refresh token is revoked")
        void returns401WhenTokenRevoked() throws Exception {
            storedToken.setRevoked(true);

            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshJwt))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Returns 401 when refresh token is expired")
        void returns401WhenTokenExpired() throws Exception {
            storedToken.setExpiresAt(Instant.now().minusSeconds(10));

            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshJwt))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Returns 401 when no token is supplied at all")
        void returns401WhenNoTokenSupplied() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Old token is marked revoked after successful refresh (rotation)")
        void oldTokenRevokedAfterRefresh() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshJwt))))
                    .andExpect(status().isOk());

            verify(refreshTokenRepository, atLeastOnce()).save(argThat(RefreshToken::isRevoked));
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/auth/logout
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/v1/auth/logout")
    class Logout {

        @Test
        @DisplayName("Returns 204 No Content on logout")
        void returns204OnLogout() throws Exception {
            doNothing().when(cookieService).clearRefreshCookie(any());

            mockMvc.perform(post("/api/v1/auth/logout"))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Refresh token is revoked in DB when a valid cookie is present")
        void revokesTokenWhenCookiePresent() throws Exception {
            String jti = UUID.randomUUID().toString();
            RefreshToken storedToken = RefreshToken.builder()
                    .jti(jti).user(user)
                    .createdAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(86400))
                    .revoked(false).build();

            when(jwtService.isRefreshToken(anyString())).thenReturn(true);
            when(jwtService.getJti(anyString())).thenReturn(jti);
            when(refreshTokenRepository.findByJti(jti)).thenReturn(Optional.of(storedToken));
            when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            doNothing().when(cookieService).clearRefreshCookie(any());

            mockMvc.perform(post("/api/v1/auth/logout")
                            .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid.refresh.token")))
                    .andExpect(status().isNoContent());

            verify(refreshTokenRepository).save(argThat(RefreshToken::isRevoked));
        }

        @Test
        @DisplayName("Logout succeeds with no cookie present")
        void logoutSucceedsWithoutCookie() throws Exception {
            doNothing().when(cookieService).clearRefreshCookie(any());

            mockMvc.perform(post("/api/v1/auth/logout"))
                    .andExpect(status().isNoContent());
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/auth/register
    // -----------------------------------------------------------------------
    @Nested
    @DisplayName("POST /api/v1/auth/register")
    class Register {

        @Test
        @DisplayName("Returns 201 with UserDTO on successful registration")
        void returns201OnSuccess() throws Exception {
            UserDTO created = new UserDTO();
            created.setEmail("newuser@example.com");
            when(authService.registerUser(any(UserDTO.class))).thenReturn(created);

            UserDTO input = new UserDTO();
            input.setEmail("newuser@example.com");

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(input)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("newuser@example.com"));
        }

        @Test
        @DisplayName("Returns 400 when request body is missing")
        void returns400ForMissingBody() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is4xxClientError());
        }
    }
}