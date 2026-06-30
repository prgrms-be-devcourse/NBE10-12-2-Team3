package com.scommit.domain.user.user.dto;

public record UserPasswordUpdateResponse(
        String accessToken,
        String refreshToken,
        int expiresIn
) {}
