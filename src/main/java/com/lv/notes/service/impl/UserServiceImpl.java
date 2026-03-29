package com.lv.notes.service.impl;

import com.lv.notes.dto.UserDTO;
import com.lv.notes.domain.entity.Provider;
import com.lv.notes.domain.entity.Role;
import com.lv.notes.domain.entity.User;
import com.lv.notes.exceptions.ResourceNotFoundException;
import com.lv.notes.helper.UserHelper;
import com.lv.notes.repository.RoleRepository;
import com.lv.notes.repository.UserRepository;
import com.lv.notes.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is Required");
        }

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email Already Exists");
        }

        // 1. Map basic fields (skipping roles and password for manual handling)
        User user = modelMapper.map(userDTO, User.class);

        // 2. CRITICAL: Encode the password before saving
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        // 3. Set Provider
        user.setProvider(userDTO.getProvider() != null ? userDTO.getProvider() : Provider.LOCAL);

        // 4. Assign Default Role (Fixes the 500 mapping error)
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default Role 'ROLE_USER' not found in database"));
        user.setRoles(Collections.singleton(defaultRole));

        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UserDTO userDTO, String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User existingUser = userRepository.findById(uId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userDTO.getName() != null) existingUser.setName(userDTO.getName());
        if (userDTO.getImage() != null) existingUser.setImage(userDTO.getImage());
        if (userDTO.getProvider() != null) existingUser.setProvider(userDTO.getProvider());

        // Only update and re-encode password if it's provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        existingUser.setEnabled(userDTO.isEnabled());

        User updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserDTO.class);
    }

    @Override
    public void deleteUser(String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        if (!userRepository.existsById(uId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(uId);
    }

    @Override
    public UserDTO getUserById(String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User user = userRepository.findById(uId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public Iterable<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }
}