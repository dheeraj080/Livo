package com.lv.notes.repository;

import com.lv.notes.domain.entity.Provider;
import com.lv.notes.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    // Check if an email is already taken during signup
    Boolean existsByEmail(String email);

    // Find a user by their name (useful for profile pages)
    Optional<User> findByName(String name);

    Optional<User> findByProviderAndProviderId(Provider provider, String providerId);
}
