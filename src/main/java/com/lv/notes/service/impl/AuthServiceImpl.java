package com.lv.notes.service.impl;

import com.lv.notes.dto.UserDTO;
import com.lv.notes.service.AuthService;
import com.lv.notes.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;

    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        // This is where you would typically call a PasswordEncoder
        // before passing the DTO to the userService.
        return userService.createUser(userDTO); // Fixed the variable name here
    }
}
