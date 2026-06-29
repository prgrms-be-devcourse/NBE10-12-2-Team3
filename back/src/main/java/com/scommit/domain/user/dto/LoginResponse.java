package com.scommit.domain.user.dto;

import com.scommit.domain.user.entity.User;
import com.scommit.domain.user.entity.UserRole;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        int expiresIn,
        LoginProfile user
) {
    public record LoginProfile(
            Long id,
            String email,
            String nickname,
            UserRole role
    ) {}

    public LoginResponse(String accessToken, String refreshToken, int expiresIn, User user) {
        this(
                accessToken,
                refreshToken,
                expiresIn,
                new LoginProfile(
                        user.getId(),
                        user.getEmail(),
                        user.getNickname(),
                        user.getRole()
                )
        );
    }
}
