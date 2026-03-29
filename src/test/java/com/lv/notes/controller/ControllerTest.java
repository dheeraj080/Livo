package com.lv.notes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lv.notes.config.SecurityConfig;
import com.lv.notes.dto.LoginRequest;
import com.lv.notes.dto.UserDTO;
import com.lv.notes.domain.entity.User;
import com.lv.notes.exceptions.ResourceNotFoundException;
import com.lv.notes.repository.UserRepository;
import com.lv.notes.security.JwtAuthenticationFilter;
import com.lv.notes.security.JwtService;
import com.lv.notes.service.AuthService;
import com.lv.notes.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {AuthController.class, UserController.class})
@Import(SecurityConfig.class)
class ControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // --- AuthController deps ---
    @MockitoBean AuthService authService;
    @MockitoBean AuthenticationManager authenticationManager;
    @MockitoBean UserRepository userRepository;
    @MockitoBean JwtService jwtService;
    @MockitoBean ModelMapper modelMapper;

    // --- UserController deps ---
    @MockitoBean UserService userService;

    // --- Filter dep (needed by SecurityConfig) ---
    @MockitoBean JwtAuthenticationFilter jwtAuthenticationFilter;

    // --- Shared test data ---
    private UserDTO sampleUser;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        sampleId = UUID.randomUUID();
        sampleUser = UserDTO.builder()
                .id(sampleId)
                .name("Joe")
                .email("joe@example.com")
                .build();
    }

    // =========================================================
    // AuthController — POST /api/v1/auth/register
    // =========================================================
    @Nested
    class Register {

        @Test
        void validInput_returns201AndUser() throws Exception {
            UserDTO request = UserDTO.builder()
                    .email("joe@example.com")
                    .password("joe")
                    .name("Joe")
                    .build();

            when(authService.registerUser(any())).thenReturn(sampleUser);

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("joe@example.com"))
                    .andExpect(jsonPath("$.id").value(sampleId.toString()))
                    // Password must NEVER be returned
                    .andExpect(jsonPath("$.password").doesNotExist());
        }

        @Test
        void duplicateEmail_returns400() throws Exception {
            UserDTO request = UserDTO.builder()
                    .email("joe@example.com")
                    .password("joe")
                    .build();

            when(authService.registerUser(any()))
                    .thenThrow(new IllegalArgumentException("Email Already Exists"));

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void emptyBody_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void noContentType_returns415() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .content("not json"))
                    .andExpect(status().isUnsupportedMediaType());
        }
    }

    // =========================================================
    // AuthController — POST /api/v1/auth/login
    // =========================================================
    @Nested
    class Login {

        @Test
        void validCredentials_returns200WithTokens() throws Exception {
            LoginRequest request = new LoginRequest("joe@example.com", "joe");

            User mockUser = new User();

            UserDTO mockUserDTO = UserDTO.builder()
                    .email("joe@example.com")
                    .build();

            when(authenticationManager.authenticate(any()))
                    .thenReturn(new UsernamePasswordAuthenticationToken(
                            "joe@example.com", "joe"));
            when(userRepository.findByEmail("joe@example.com"))
                    .thenReturn(Optional.of(mockUser));
            when(jwtService.generateAccessToken(mockUser)).thenReturn("access-token");
            when(jwtService.generateRefreshToken(any(), any())).thenReturn("refresh-token");
            when(jwtService.getAccessTtlSeconds()).thenReturn(3600L);
            when(modelMapper.map(mockUser, UserDTO.class)).thenReturn(mockUserDTO);

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token"))
                    .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.expiresIn").value(3600));
        }

        @Test
        void invalidCredentials_returns401() throws Exception {
            LoginRequest request = new LoginRequest("joe@example.com", "wrongpassword");

            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void userNotFoundAfterAuth_returns401() throws Exception {
            LoginRequest request = new LoginRequest("ghost@example.com", "joe");

            when(authenticationManager.authenticate(any()))
                    .thenReturn(new UsernamePasswordAuthenticationToken(
                            "ghost@example.com", "joe"));
            when(userRepository.findByEmail("ghost@example.com"))
                    .thenReturn(Optional.empty());

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void missingBody_returns400() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // =========================================================
    // UserController — all endpoints require authentication
    // =========================================================
    @Nested
    class UserEndpointsUnauthenticated {

        @Test
        void getAllUsers_noToken_returns401() throws Exception {
            mockMvc.perform(get("/api/v1/users"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void getUserById_noToken_returns401() throws Exception {
            mockMvc.perform(get("/api/v1/users/{id}", sampleId))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void createUser_noToken_returns401() throws Exception {
            mockMvc.perform(post("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void updateUser_noToken_returns401() throws Exception {
            mockMvc.perform(put("/api/v1/users/{id}", sampleId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void deleteUser_noToken_returns401() throws Exception {
            mockMvc.perform(delete("/api/v1/users/{id}", sampleId))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @WithMockUser // simulates an authenticated user for all tests in this block
    class UserEndpointsAuthenticated {

        @Test
        void getAllUsers_returns200WithList() throws Exception {
            when(userService.getAllUsers()).thenReturn(List.of(sampleUser));

            mockMvc.perform(get("/api/v1/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].email").value("joe@example.com"));
        }

        @Test
        void getUserById_existingId_returns200() throws Exception {
            when(userService.getUserById(sampleId.toString())).thenReturn(sampleUser);

            mockMvc.perform(get("/api/v1/users/{id}", sampleId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(sampleId.toString()))
                    .andExpect(jsonPath("$.email").value("joe@example.com"));
        }

        @Test
        void getUserById_notFound_returns404() throws Exception {
            when(userService.getUserById(any()))
                    .thenThrow(new ResourceNotFoundException("User not found"));

            mockMvc.perform(get("/api/v1/users/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }

        @Test
        void getUserByEmail_existingEmail_returns200() throws Exception {
            when(userService.getUserByEmail("joe@example.com")).thenReturn(sampleUser);

            mockMvc.perform(get("/api/v1/users/email/{email}", "joe@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("joe@example.com"));
        }

        @Test
        void getUserByEmail_notFound_returns404() throws Exception {
            when(userService.getUserByEmail(any()))
                    .thenThrow(new ResourceNotFoundException("User not found"));

            mockMvc.perform(get("/api/v1/users/email/{email}", "ghost@example.com"))
                    .andExpect(status().isNotFound());
        }

        @Test
        void createUser_validInput_returns201() throws Exception {
            when(userService.createUser(any())).thenReturn(sampleUser);

            mockMvc.perform(post("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("joe@example.com"));
        }

        @Test
        void updateUser_existingId_returns200() throws Exception {
            UserDTO updated = UserDTO.builder()
                    .id(sampleId)
                    .name("Joe Updated")
                    .email("joe@example.com")
                    .build();

            when(userService.updateUser(any(), eq(sampleId.toString()))).thenReturn(updated);

            mockMvc.perform(put("/api/v1/users/{id}", sampleId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Joe Updated"));
        }

        @Test
        void updateUser_notFound_returns404() throws Exception {
            when(userService.updateUser(any(), any()))
                    .thenThrow(new ResourceNotFoundException("User not found"));

            mockMvc.perform(put("/api/v1/users/{id}", UUID.randomUUID())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleUser)))
                    .andExpect(status().isNotFound());
        }

        @Test
        void deleteUser_existingId_returns204() throws Exception {
            doNothing().when(userService).deleteUser(sampleId.toString());

            mockMvc.perform(delete("/api/v1/users/{id}", sampleId))
                    .andExpect(status().isNoContent());
        }

        @Test
        void deleteUser_notFound_returns404() throws Exception {
            doThrow(new ResourceNotFoundException("User not found"))
                    .when(userService).deleteUser(any());

            mockMvc.perform(delete("/api/v1/users/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }
    }
}