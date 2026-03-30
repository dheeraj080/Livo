package com.lv.notes.dto;

import com.lv.notes.domain.entity.Provider;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private UUID id; // Usually null during registration
    private String name;
    private String email;
    private String password; // Raw password from the user
    private String image;

    // Use the 'is' prefix manually or ensure it matches the JSON property
    @Builder.Default
    private boolean enabled = true;

    private Instant createdAt;
    private Instant updatedAt;

    private Provider provider;

    // Use RoleDTO to avoid circular references with the User Entity
    private Set<RoleDTO> roles = new HashSet<>();
}