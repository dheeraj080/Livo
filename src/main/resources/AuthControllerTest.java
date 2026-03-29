//package com.lv.notes.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.lv.notes.dto.LoginRequest;
//import com.lv.notes.dto.TokenResponse;
//import com.lv.notes.dto.UserDTO;
//import com.lv.notes.domain.entity.User;
//import com.lv.notes.repository.UserRepository;
//import com.lv.notes.security.JwtService;
//import com.lv.notes.service.AuthService;
//import org.junit.jupiter.api.Test;
//import org.modelmapper.ModelMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.MediaType;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@WebMvcTest(AuthController.class)
//class AuthControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    // --- Mock all dependencies AuthController needs ---
//    @MockitoBean private AuthService authService;
//    @MockitoBean private AuthenticationManager authenticationManager;
//    @MockitoBean private UserRepository userRepository;
//    @MockitoBean private JwtService jwtService;
//    @MockitoBean private ModelMapper modelMapper;
//
//    // =========================================================
//    // POST /api/v1/auth/login
//    // =========================================================
//
//    @Test
//    void login_validCredentials_returns200WithTokens() throws Exception {
//        // Arrange
//        LoginRequest request = new LoginRequest("joe@example.com", "joe");
//
//        User mockUser = new User();
//        mockUser.setEmail("joe@example.com");
//
//        UserDTO mockUserDTO = new UserDTO();
//        mockUserDTO.setEmail("joe@example.com");
//
//        TokenResponse mockToken = TokenResponse.of(
//                "access-token-xyz",
//                "refresh-token-xyz",
//                3600L,
//                mockUserDTO
//        );
//
//        when(authenticationManager.authenticate(any()))
//                .thenReturn(new UsernamePasswordAuthenticationToken(
//                        "joe@example.com", "joe"));
//        when(userRepository.findByEmail("joe@example.com"))
//                .thenReturn(Optional.of(mockUser));
//        when(jwtService.generateAccessToken(mockUser)).thenReturn("access-token-xyz");
//        when(jwtService.generateRefreshToken(any(), any())).thenReturn("refresh-token-xyz");
//        when(jwtService.getAccessTtlSeconds()).thenReturn(3600L);
//        when(modelMapper.map(mockUser, UserDTO.class)).thenReturn(mockUserDTO);
//
//        // Act & Assert
//        mockMvc.perform(post("/api/v1/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.accessToken").value("access-token-xyz"))
//                .andExpect(jsonPath("$.refreshToken").value("refresh-token-xyz"));
//    }
//
//    @Test
//    void login_invalidCredentials_returns401() throws Exception {
//        // Arrange
//        LoginRequest request = new LoginRequest("joe@example.com", "wrongpassword");
//
//        when(authenticationManager.authenticate(any()))
//                .thenThrow(new BadCredentialsException("Bad credentials"));
//
//        // Act & Assert
//        mockMvc.perform(post("/api/v1/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    void login_missingEmail_returns400() throws Exception {
//        // Arrange — no email field
//        String body = """
//                { "password": "joe" }
//                """;
//
//        // Act & Assert
//        mockMvc.perform(post("/api/v1/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(body))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    void login_missingPassword_returns400() throws Exception {
//        String body = """
//                { "email": "joe@example.com" }
//                """;
//
//        mockMvc.perform(post("/api/v1/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(body))
//                .andExpect(status().isBadRequest());
//    }
//
//    // =========================================================
//    // POST /api/v1/auth/register
//    // =========================================================
//
//    @Test
//    void register_validInput_returns201WithUser() throws Exception {
//        // Arrange
//        UserDTO request = new UserDTO();
//        request.setEmail("joe@example.com");
//        request.setPassword("joe");
//        request.setName("Joe");
//
//        UserDTO response = new UserDTO();
//        response.setId(UUID.randomUUID());
//        response.setEmail("joe@example.com");
//        response.setName("Joe");
//
//        when(authService.registerUser(any())).thenReturn(response);
//
//        // Act & Assert
//        mockMvc.perform(post("/api/v1/auth/register")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.email").value("joe@example.com"))
//                .andExpect(jsonPath("$.id").isNotEmpty())
//                // Password must never be returned in the response
//                .andExpect(jsonPath("$.password").doesNotExist());
//    }
//
//    @Test
//    void register_duplicateEmail_returns400() throws Exception {
//        // Arrange
//        UserDTO request = new UserDTO();
//        request.setEmail("joe@example.com");
//        request.setPassword("joe");
//
//        when(authService.registerUser(any()))
//                .thenThrow(new IllegalArgumentException("Email Already Exists"));
//
//        // Act & Assert
//        mockMvc.perform(post("/api/v1/auth/register")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    void register_emptyBody_returns400() throws Exception {
//        mockMvc.perform(post("/api/v1/auth/register")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("{}"))
//                .andExpect(status().isBadRequest());
//    }
//}