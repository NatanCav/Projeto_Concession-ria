package com.concessionaria.user.dto;

import com.concessionaria.user.User;
import com.concessionaria.user.UserRole;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt());
    }
}
