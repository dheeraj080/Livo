package com.lv.notes.service.impl;

import com.lv.notes.dto.UserDTO;
import com.lv.notes.domain.entity.User;
import com.lv.notes.exceptions.ResourceNotFoundException;
import com.lv.notes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserDTO userDTO;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setName("Original Name");

        userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");
        userDTO.setName("Original Name");
    }

    @Test
    @DisplayName("Create User: Should save and return UserDTO when valid")
    void createUser_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(modelMapper.map(any(UserDTO.class), eq(User.class))).thenReturn(user);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(modelMapper.map(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);

        UserDTO result = userService.createUser(userDTO);

        assertNotNull(result);
        assertEquals(userDTO.getEmail(), result.getEmail());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Create User: Should throw Exception when email exists")
    void createUser_EmailExists() {
        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(userDTO));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update User: Should update only non-null fields")
    void updateUser_PartialUpdate() {
        // Prepare update DTO with ONLY a name change
        UserDTO updateDTO = new UserDTO();
        updateDTO.setName("New Name");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(modelMapper.map(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);

        userService.updateUser(updateDTO, userId.toString());

        assertEquals("New Name", user.getName());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Get User: Should throw ResourceNotFound when ID doesn't exist")
    void getUserById_NotFound() {
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserById(userId.toString()));
    }

    @Test
    @DisplayName("Delete User: Should call delete when user exists")
    void deleteUser_Success() {
        when(userRepository.existsById(userId)).thenReturn(true);

        userService.deleteUser(userId.toString());

        verify(userRepository).deleteById(userId);
    }
}