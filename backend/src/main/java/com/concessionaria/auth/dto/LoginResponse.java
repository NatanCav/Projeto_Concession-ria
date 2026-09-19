package com.concessionaria.auth.dto;

import com.concessionaria.user.dto.UserResponse;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInMs,
        UserResponse user
) {
}
