package com.lv.notes;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class encodingtest {

    @Test
    void passwordRoundTrip() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "joe";

        // Simulate exactly what registration does
        String stored = encoder.encode(raw); // or call your actual service method

        System.out.println("Hash length: " + stored.length()); // must be 60
        System.out.println("Starts with $2: " + stored.startsWith("$2"));

        // Simulate exactly what login does
        assertTrue(encoder.matches(raw, stored));
    }

    @Test
    void matchAgainstActualDbHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashFromDb = "$2a$10$NY9Uz67NGFzDyfX9t/3XxuuCZWMPYsypzbULayltVpXCrBs5oAoa2";
        System.out.println(encoder.matches("joe", hashFromDb));
    }
}
